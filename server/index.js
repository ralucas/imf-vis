var fs          = require('fs'),
    path        = require('path');

var express     = require('express'),
    browserify  = require('browserify-middleware'),
    reactify    = require('reactify'),
    less        = require('less-middleware'),
    nunjucks    = require('nunjucks'),
    logger      = require('morgan'),
    config      = require('../config');

var clientConfig = config.get('client');

var favicon = require('serve-favicon');

//Routes
var routes = require('./routes');

// initialise express
var app = express();

app.locals.config = config;

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

app.use(favicon(path.join(publicDir, '/images/favicon.ico')));

// less will automatically compile matching requests for .css files
app.use(less(publicDir));

// public assets are served before any dynamic requests
app.use(express.static(publicDir));
console.log(clientConfig.common.packages);
// common packages are precompiled on server start and cached
app.get('/js/' + clientConfig.common.bundle, browserify(clientConfig.common.packages, {
  ignore: ['system', 'file'],
	cache: true,
	precompile: true 
}));

// any file in /client/scripts will automatically be browserified,
// excluding common packages.
app.use('/js', browserify(path.join(__dirname, '../client/scripts'), {
	external: clientConfig.common.packages,
	transform: ['reactify', 'brfs']
}));

//Routes
routes(app);

// start the server
var server = app.listen(config.get('port'), function() {
	console.log('\nServer ready on port %d\n', server.address().port);
});

