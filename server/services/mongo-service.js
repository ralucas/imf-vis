var mongoose = require('mongoose');
var Q = require('q');

var Subject = require('../models/subject');

var MONGO_URI = process.env.MONGOLAB_URI || 'mongodb://localhost/imf';

mongoose.connect(MONGO_URI);

function MongoService(config) {
  this.config = config || {};

  this.model = Subject;

  this.db = mongoose.connection; 

  this.db.on('error', console.error.bind(console, 'connection error:'));

  this.db.once('open', function (callback) {
    console.log('Connected to MongoDB instance at: ' + MONGO_URI);
  });
}

MongoService.prototype.find = function(params) {
  var Model = this.model;
  return Q.ninvoke(Model, 'find', params);
};

module.exports = new MongoService();
