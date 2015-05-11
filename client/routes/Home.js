React = require('react');
$ = require('jquery');
charts = require('../scripts/charts');

var legend = {
  legendTitle : "LEGEND",
  defaultFillName: "No data",
  labels: {
    "0": "LEAST",
    "1": " ",
    "2": " ",
    "3": " ",
    "4": " ",
    "5": " ",
    "6": " ",
    "7": " ",
    "8": " ",
    "9": " ",
    "10": " ",
    "11": " ",
    "12": "MOST" 
  }
} 

var Home = React.createClass({
  getReports: function() {
    var that = this;
    return $.get('/country/AUS')
      .then(function(data) {
        if (that.isMounted()) {
          var title = data.reports[0].description.toUpperCase() + ' IN ' + data.reports[0].units.toUpperCase();
          that.setState({reports: data.reports, reportTitle: title});
          charts.worldMap(data.reports[0].id, 2014)
            .then(function(map) {
              map.legend(legend);
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
        map.legend(legend);
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
        <option id={report.id} value={report.id} key={report.id} data-title="{report.description} in {report.units}">{report.description} in {report.units}</option>
      );
    });
    return (
      <div id="main" className="container">
        <h1>{this.state.reportTitle}</h1>
        <hr/>
        <div id="slider-container">
          <input id="yearSlider"
            type="range" 
            value={this.state.year} 
            min="2014" 
            max="2019" 
            onInput={this.sliderChange} 
            step="1" />
          <label for="yearSlider">YEAR: <span className="lead" id="yearNum">{this.state.year}</span></label>
        </div>
        <br />
        <div id="chart"></div>
        <hr/>
        <div id="select-container">
          <label className="lead" for="reports">SELECT REPORT DATA TO VIEW</label>
          <select className="form-control" id="reports" onChange={this.handleSelect}>
            {options}
          </select>
        </div>
      </div>
    );
	}
});

var Slider = React.createClass({

  getInitialState: function() {
    return {year: "2014"}
  },

  sliderChange: function(e) {
    this.setState({year: e.target.value});
  },

  render: function() {
    return (
      <div id="slider-container">
        <input id="yearSlider"
          type="range" 
          value="2014" 
          min="2014" 
          max="2019" 
          onChange={this.sliderChange} 
          step="1" />
        <label for="yearSlider">YEAR: <span className="lead" id="yearNum">{this.state.year}</span></label>
      </div>
    );

  }
});

module.exports = Home;
