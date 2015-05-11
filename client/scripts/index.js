var React = require('react'),
	Router = require('react-router'),
  charts = require('./charts'),
  $ = require('jquery');

var Header = React.createClass({
	render: function() {
		return (
			<div className="page-header">
				<h1>IMF Visualizations</h1>
			</div>
		);
	}
});

var PageNav = React.createClass({
	render: function() {
		return (
			<div className="nav">
				<Router.Link to="home">Home</Router.Link>
				&nbsp; | &nbsp;
				<Router.Link to="about">About</Router.Link>
			</div>
		);
	}
});

var App = React.createClass({
	render: function() {
		return (
			<div className="container">
				<Header />
				<PageNav />
				<Router.RouteHandler/>
			</div>
		);
	}
});

var routes = {
	Home: require('../routes/Home'),
	About: require('../routes/About'),
  Map: require('../routes/Map')
};

var routes = (
	<Router.Route name="app" path="/" handler={App}>
		<Router.Route name="home" path="/" handler={routes.Home}/>
		<Router.Route name="about" path="/about" handler={routes.About}/>
    <Router.Route name="map" path="/map" handler={routes.Map}/>
		<Router.DefaultRoute handler={routes.Home}/>
	</Router.Route>
);

Router.run(routes, Router.HistoryLocation, function (Handler) {
	React.render(<Handler/>, document.body);
  //charts
  var map;
  charts.worldMap("GGXWDN_NGDP")
    .then(function(map) {
      map = map;
      //map.legend();
      window.addEventListener('resize', function() {
         map.resize();
       });   
    });
  $(document).on('click', '#chart', function() {
    console.log('hj');
    map.legend();
  });
});
