React = require('react');
d3 = require('d3');
topojson = require('topojson');
datamaps = require('datamaps/dist/datamaps.all.js');

var Home = React.createClass({
	render: function() {
    //new Datamap({element: document.getElementById('chart')});
    return (
      React.createElement('div', {id: 'chart'})
		);
	}
});

//var Chart = React.createClass({
  //render: function() {
    //var svg = d3.select("div.chart").append("svg")
      //.attr("width", 960)
      //.attr("height", 1200);

    //d3.json(json, function(err, world) {
      //if (err) console.error('d3 error: ', err);
      //console.log(world);
    //});

    //return (
    
    //);
  //}
//});

module.exports = Home;
