(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
React = require('react');

var About = React.createClass({displayName: "About",
	render: function() {
		return (
			React.createElement("p", null, "About Page")
		);
	}
});

module.exports = About;

},{"react":"react"}],2:[function(require,module,exports){
React = require('react');
$ = require('jquery');
charts = require('../scripts/charts');

var Home = React.createClass({displayName: "Home",
  getReports: function() {
    var that = this;
    return $.get('/country/AUS')
      .then(function(data) {
        if (that.isMounted()) {
          var title = data.reports[0].description.toUpperCase() + ' IN ' + data.reports[0].units.toUpperCase();
          that.setState({reports: data.reports, reportTitle: title});
          charts.worldMap(data.reports[0].id, 2014)
            .then(function(map) {
              map.legend(charts.legend);
            });
        }
      })
      .fail(function(err) {
        console.log(err);
      });
  },
  getInitialState: function() {
    return {reports: [], year: "2014", selected:"NGDP_R"};
  },
	componentDidMount: function() {
    this.getReports();
  },
  shouldComponentUpdate: function(pre, next) {
    if (next) {
      this.updated = true;
      return true;
    } else {
      return false;
    }
  },
  handleSelect: function(e) {
    var that = this;
    var value = e.target.value;
    var id = '#' + value;
    var title = $(e.target).find(id).text().toUpperCase();
    this.setState({
      selected: value,
      year: "2014",
      reportTitle: title
    });
    var year = 2014;
    charts.worldMap(value, year)
      .then(function(map) {
        map.legend(charts.legend);
      });
  },
  sliderChange: function(e) {
    var yearNum = parseInt(e.target.value);
    this.setState({year: e.target.value});
    charts.updateColors(this.state.selected, yearNum);
  },
  render: function() {    
    var that = this;
    var options = this.state.reports.map(function(report) {
      return (
        React.createElement("option", {id: report.id, value: report.id, key: report.id, "data-title": "{report.description} in {report.units}"}, report.description, " in ", report.units)
      );
    });
    return (
      React.createElement("div", {id: "main", className: "container"}, 
        React.createElement("h1", null, this.state.reportTitle), 
        React.createElement("hr", null), 
        React.createElement("div", {id: "slider-container"}, 
          React.createElement("input", {id: "yearSlider", 
            type: "range", 
            value: this.state.year, 
            min: "2014", 
            max: "2019", 
            onInput: this.sliderChange, 
            step: "1"}), 
          React.createElement("label", {for: "yearSlider"}, "YEAR: ", React.createElement("span", {className: "lead", id: "yearNum"}, this.state.year))
        ), 
        React.createElement("br", null), 
        React.createElement("div", {id: "chart"}, 
          React.createElement("div", {id: "loader"}, 
            React.createElement("img", {src: "../images/loading.gif", width: "100px"})
          )
        ), 
        React.createElement("hr", null), 
        React.createElement("div", {id: "select-container"}, 
          React.createElement("label", {className: "lead", for: "reports"}, "SELECT REPORT DATA TO VIEW"), 
          React.createElement("select", {className: "form-control", id: "reports", onChange: this.handleSelect}, 
            options
          )
        )
      )
    );
	}
});

module.exports = Home;

},{"../scripts/charts":4,"jquery":"jquery","react":"react"}],3:[function(require,module,exports){
React = require('react');
$ = require('jquery');
charts = require('../scripts/charts');

var Map = React.createClass({displayName: "Map",

  render: function() {
    return (
      React.createElement("div", null, "Map")
    );
  }
});

module.exports = Map;

},{"../scripts/charts":4,"jquery":"jquery","react":"react"}],4:[function(require,module,exports){
d3 = require('d3');
topojson = require('topojson');
datamaps = require('datamaps/dist/datamaps.all.js');
$ = require('jquery');
_ = require('lodash');

path = require('path');


var mapConfig = "{\n  \"numberOfColors\": 25\n}\n";
var numberOfColors = JSON.parse(mapConfig).numberOfColors;

function createQueryString(params) {
  var queryString = '?';
  var queryParams = _.omit(params, 'subjectCode');
  for (var key in queryParams) {
    if (queryParams[key]) {
      queryString += key + '=' + queryParams[key] + '&';
    }
  }
  return queryString.slice(0, queryString.length - 1);
}

function createLegend() {
  var legend = {
    legendTitle: "LEGEND",
    defaultFillName: "NO DATA",
    labels: {
      "0": "NO DATA",
      "1": "LEAST"
    }
  };
  for(var i = 2; i <= numberOfColors; i++){
    var key = i.toString();
    legend.labels[key] = " ";
    if (i === (numberOfColors - 1)) {
      legend.labels[key] = "MOST";
    }
  }
  return legend;
}

module.exports = {

  cachedMap: {},

  cachedData: this.cachedData || {},

  legend: createLegend(numberOfColors),
    
  scale: function() {
    var start = 60 / numberOfColors;
    var defaultFill = 'rgba(0,0,0,0.1)';
    var colors = [defaultFill];
    var fills = {
      '0': defaultFill 
    };
    for(var i = 0; i < (numberOfColors-1); i++) {
      var percent = 90 - (start * i);
      var color = 'hsla(10, 90%, ' + percent + '%, 1)';
      colors.push(color);
      var str = i.toString();
      fills[str] = color;
    }

    return {
      colors: colors,
      fills: fills
    };
  },

  httpGet: function(params) {
    var queryString = createQueryString(params); 
    var url = '/subject/' + params.subjectCode + queryString; 
    return $.get(url);
  },

  worldMap: function(code, year) {
    var colors = this.scale();
    var that = this;
    $('#chart').empty();
    year = year || '';
    var promise = this.httpGet({subjectCode: code, year: year});

    return promise
      .then(function(data) {
        console.log('d', data);
        that.cachedData = data;

        that.cachedMap = new Datamap({
          element: document.getElementById('chart'),
          responsive: true,
          fills: colors.fills,
          data: data,
          geographyConfig: {
            popupTemplate: function(geo, data) {
              var chart = document.getElementById('chart');
              chart.onclick = function() {
                that.newMap(code, geo.id, year, geo.geometry.coordinates[0]);
              };
              return '<div class="hoverinfo"><p><strong>' +
                geo.properties.name + '</strong></p>' +
                '<p><strong>Data:</strong><span> ' + 
                (data.comp*100).toFixed(2) + '% Change</span></p></div>';
            }
          }
        });
        return that.cachedMap;
    });
  },

  newMap: function(code, countryId, year, coord) {
    var that = this;
    var colors = this.scale();
    $('#chart').empty();
    var coords = _.flattenDeep(coord);
    year = year || '';
    var promise = this.httpGet({subjectCode: code, year: year, countryId: countryId});

    return promise
      .then(function(data) {
        _.assign(that.cachedData[data[0].ISO], data[0]);
        data = that.cachedData;

        that.cachedMap = new Datamap({
          element: document.getElementById('chart'), 
          responsive: true,
          fills: colors.fills,
          data: data,
          setProjection: function(element) {
            var projection = d3.geo.equirectangular()
              .center([coords[0], coords[1]])
              .rotate([4.4, 0])
              .scale(400)
              .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
            var path = d3.geo.path()
              .projection(projection);
            
            return {path: path, projection: projection};
          },
          geographyConfig: {
            popupTemplate: function(geo, data) {
              var chart = document.getElementById('chart');
              chart.onclick = function() {
                that.worldMap(code, year);
              };

              var dataString = function(d) {
                var firstPart = '<p><strong>Data: </strong>'; 
                var lastPart = '';
                
                if (d !== null && d.hasOwnProperty('AnnualData')) {
                  lastPart = '</p>';
                  var len = d.AnnualData.length;
                  var annualData = d.AnnualData.slice(len-11, len-1);
                  _.forEach(annualData, function(year) {
                    if (year.Year && year.Data) { 
                      lastPart += '<p><strong>' + year.Year + ':</strong> ' + year.Data + '</p>';
                    }
                  });
                } else {
                  lastPart = '<span>' + d.data + '</span></p>';
                }
                return firstPart + lastPart;
              };
              return '<div class="hoverinfo"><p><strong>' +
                geo.properties.name + '</strong></p>' +
                dataString(data) + '</div>'; 
            }
          },
          done: function(map) {
            map.legend(that.legend);
          }
        });
        return that.cachedMap;
    });
  },

  updateColors: function(reportId, year) {
    var that = this;
    var colors = this.scale().colors;
    var promise = this.httpGet({subjectCode: reportId, year: year});
    var colorUpdate = {};

    return promise
      .then(function(data) {
        that.cachedData = data;
        console.log('ucd', data);

        _.forEach(data, function(value, country) {
          colorUpdate[country] = colors[value.fillKey];
        });

        var element = document.getElementById('chart');

        that.cachedMap.updateChoropleth(colorUpdate);
        
      });
  }

};


},{"d3":"d3","datamaps/dist/datamaps.all.js":"datamaps/dist/datamaps.all.js","jquery":"jquery","lodash":"lodash","path":6,"topojson":"topojson"}],5:[function(require,module,exports){
var React = require('react'),
	Router = require('react-router'),
  charts = require('./charts'),
  $ = require('jquery');

var Header = React.createClass({displayName: "Header",
	render: function() {
		return (
			React.createElement("div", {className: "page-header"}, 
				React.createElement("h1", null, "VISUALIZATIONS"), 
        React.createElement("div", {id: "text-logo"})
			)
		);
	}
});

var Footer = React.createClass({displayName: "Footer",
	render: function() {
		return (
			React.createElement("div", {className: "page-footer"}
			)
		);
	}
});


var PageNav = React.createClass({displayName: "PageNav",
	render: function() {
		return (
			React.createElement("div", {className: "nav"}, 
				React.createElement(Router.Link, {to: "home"}, "Home"), 
				"  |  ", 
				React.createElement(Router.Link, {to: "about"}, "About")
			)
		);
	}
});

var App = React.createClass({displayName: "App",
	render: function() {
		return (
			React.createElement("div", null, 
				React.createElement(Header, null), 
				React.createElement(Router.RouteHandler, null), 
        React.createElement(Footer, null)
			)
		);
	}
});

var routes = {
	Home: require('../routes/Home'),
	About: require('../routes/About'),
  Map: require('../routes/Map')
};

var routes = (
	React.createElement(Router.Route, {name: "app", path: "/", handler: App}, 
		React.createElement(Router.Route, {name: "home", path: "/", handler: routes.Home}), 
		React.createElement(Router.Route, {name: "about", path: "/about", handler: routes.About}), 
    React.createElement(Router.Route, {name: "map", path: "/map", handler: routes.Map}), 
		React.createElement(Router.DefaultRoute, {handler: routes.Home})
	)
);

Router.run(routes, Router.HistoryLocation, function (Handler) {
	React.render(React.createElement(Handler, null), document.body);
});

},{"../routes/About":1,"../routes/Home":2,"../routes/Map":3,"./charts":4,"jquery":"jquery","react":"react","react-router":"react-router"}],6:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":7}],7:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[4,5]);
