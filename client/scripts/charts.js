d3 = require('d3');
topojson = require('topojson');
datamaps = require('datamaps/dist/datamaps.all.js');
$ = require('jquery');

module.exports = {

  httpGet: function(params) {
    var url = '/subject/' + params.subjectCode + '/' + params.year; 
    return $.get(url);
  },

  worldMap: function(code, year) {
    year = year || '';
    var promise = this.httpGet({subjectCode: code, year: ''});
    promise.then()
      .then(function(data) {
        console.log(data);
        return data;
      });
    return new Datamap({
      element: document.getElementById('chart'),
      responsive: true
    });
  }

};
