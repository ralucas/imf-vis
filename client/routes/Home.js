React = require('react');
$ = require('jquery');

var Home = React.createClass({
  getReports: function() {
    var that = this;
    return $.get('/country/AUS')
      .then(function(data) {
        if (that.isMounted()) {
          that.setState({data: data.reports});
        }
      })
      .fail(function(err) {
        console.log(err);
      });
  },
  getInitialState: function() {
    return {data: [], year: "2014", selected:"NGDP_R"};
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
    this.setState({
      selected: value,
      year: "2014"
    });
    console.log(this.state);
    var year = 2014;
    charts.worldMap(value, year)
      .then(function(map) {
        map.legend();
      });
  },
  sliderChange: function(e) {
    var yearNum = parseInt(e.target.value);
    this.setState({year: e.target.value});
    charts.updateColors(this.state.selected, yearNum);
  },
  render: function() {    
    var that = this;
    var options = this.state.data.map(function(report) {
      return (
        <option id={report.id} value={report.id} key={report.id}>{report.description} in {report.units}</option>
      );
    });
    return (
      <div id="main">
        <select id="reports" onChange={this.handleSelect}>
          {options}
        </select>
        <br />
        <div id="slider">
          <input id="yearSlider"
            type="range" 
            value="2014" 
            min="2014" 
            max="2019" 
            onChange={this.sliderChange} 
            step="1" />
          <label for="yearSlider">Select Year: {this.state.year}</label>
        </div>
        <br />
        <div id="chart"></div>
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
      <div id="slider">
        <input id="yearSlider"
          type="range" 
          value="2014" 
          min="2014" 
          max="2019" 
          onChange={this.sliderChange} 
          step="1" />
        <label for="yearSlider">Select Year: {this.state.year}</label>
      </div>
    );

  }
})

module.exports = Home;
