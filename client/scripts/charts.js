d3 = require('d3');
topojson = require('topojson');
datamaps = require('datamaps/dist/datamaps.all.js');
$ = require('jquery');
_ = require('lodash');

path = require('path');
fs = require('fs');

var mapConfig = fs.readFileSync(path.join(__dirname, '../../config/maps.json'), 'utf8');
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

