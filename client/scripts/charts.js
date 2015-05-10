d3 = require('d3');
topojson = require('topojson');
datamaps = require('datamaps/dist/datamaps.all.js');
$ = require('jquery');
_ = require('lodash');

var cachedData = cachedData || {};

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

module.exports = {

  httpGet: function(params) {
    var queryString = createQueryString(params); 
    var url = '/subject/' + params.subjectCode + queryString; 
    return $.get(url);
  },

  worldMap: function(code, year) {
    var that = this;
    $('#chart').empty();
    year = year || '';
    var promise = this.httpGet({subjectCode: code, year: 2014});

    return promise
      .then(function(data) {
        console.log(data);
        cachedData = data;

        return new Datamap({
          element: document.getElementById('chart'),
          responsive: true,
          fills: {
            HIGH: 'orangered',
            LOW: 'cornflowerblue',
            MEDIUM: 'yellow',
            UNKNOWN: 'rgba(0,0,0,0.2)',
            defaultFill: 'rgba(0,0,0,0.2)'
          },
          data: data,
          geographyConfig: {
            popupTemplate: function(geo, data) {
              console.log(geo);
              var chart = document.getElementById('chart');
              chart.onclick = function() {
                that.newMap(code, geo.id, year, geo.geometry.coordinates[0]);
              };
              return '<div class="hoverinfo"><p><strong>' +
                geo.properties.name + '</strong></p>' +
                '<p><strong>Data:</strong><span> ' + 
                data.data + '</span></p></div>';
            }
          }
        });
    });
  },

  newMap: function(code, countryId, year, coord) {
    var that = this;
    $('#chart').empty();
    var coords = _.flattenDeep(coord);
    year = year || '';
    var promise = this.httpGet({subjectCode: code, year: '', countryId: countryId});

    return promise
      .then(function(data) {
        _.assign(cachedData[data[0].ISO], data[0]);
        console.log(cachedData);
        data = cachedData;
        
        return new Datamap({
          element: document.getElementById('chart'),
          responsive: true,
          fills: {
            HIGH: 'orangered',
            LOW: 'cornflowerblue',
            MEDIUM: 'yellow',
            UNKNOWN: 'rgba(0,0,0,0.2)',
            defaultFill: 'rgba(0,0,0,0.2)'
          },
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
                
                if (d.AnnualData && d !== null) {
                  lastPart = '</p>';
                  _.forEach(d.AnnualData, function(year) {
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
          }
        });
    });
  },


};
