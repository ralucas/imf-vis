var fs          = require('fs'),
    path        = require('path');

var express     = require('express'),
    browserify  = require('browserify-middleware'),
    reactify    = require('reactify'),
    less        = require('less-middleware'),
    nunjucks    = require('nunjucks'),
    logger      = require('morgan'),
    config      = require('../client/config');

//Routes
var routes = require('./routes');

// initialise express
var app = express();

// use nunjucks to process view templates in express
nunjucks.configure(__dirname + '/templates/views', {
    express: app
});

if (process.env.NODE_ENV !== 'production') {
  var logStream = fs.createWriteStream(path.join(__dirname, '../logs/app.log'));
}

var publicDir = path.join(__dirname, '../public');

if (process.env.NODE_ENV === 'production') {
  app.use(logger('combined'));
} else {
  app.use(logger('dev'));
}

// less will automatically compile matching requests for .css files
app.use(less(publicDir));

// public assets are served before any dynamic requests
app.use(express.static(publicDir));

// common packages are precompiled on server start and cached
app.get('/js/' + config.common.bundle, browserify(config.common.packages, {
	cache: true,
	precompile: true
}));

// any file in /client/scripts will automatically be browserified,
// excluding common packages.
app.use('/js', browserify(path.join(__dirname, '../client/scripts'), {
	external: config.common.packages,
	transform: ['reactify']
}));

//Routes
routes(app);

// start the server
var server = app.listen(process.env.PORT || 3000, function() {
	console.log('\nServer ready on port %d\n', server.address().port);
});

