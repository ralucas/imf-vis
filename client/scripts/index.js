var React = require('react'),
	Router = require('react-router'),
  charts = require('./charts'),
  $ = require('jquery');

var Header = React.createClass({
	render: function() {
		return (
			<div className="page-header">
				<h1>VISUALIZATIONS</h1>
        <div id="text-logo"></div>
        <div id="img-logo"><img src="../images/imf_logo.gif"/></div>
			</div>
		);
	}
});

var Footer = React.createClass({
	render: function() {
		return (
			<div className="page-footer">
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
			<div>
				<Header />
				<Router.RouteHandler/>
        <Footer />
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
});
