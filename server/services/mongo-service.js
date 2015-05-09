var mongoose = require('mongoose');
var Q = require('q');

var Subject = require('../models/subject');

mongoose.connect('mongodb://localhost/imf');

function MongoService(config) {
  this.config = config || {};

  this.model = Subject;

  this.db = mongoose.connection; 

  this.db.on('error', console.error.bind(console, 'connection error:'));

  this.db.once('open', function (callback) {
    console.log('Connected to Mongodb instance');
  });
}

MongoService.prototype.find = function(params) {
  var Model = this.model;
  return Q.ninvoke(Model, 'find', params);
};

module.exports = new MongoService();
