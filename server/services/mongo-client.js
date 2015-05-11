var MongoClient = require('mongodb').MongoClient;
var Q = require('q');

var Subject = require('../models/subject');

var MONGO_URI = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/imf';

function MongoService(config) {
  var _this = this;
  
  this.config = config || {};

  MongoClient.connect(MONGO_URI, function(err, db) {
    if (err) throw new Error(err);

    console.log("Connected correctly to MongoDB server: " + MONGO_URI);
    _this.db = db;
    _this.adminDb = db.admin();
  });
}

MongoService.prototype.find = function(params) {
  var deferred = Q.defer();
  var subjects = this.db.collection('subjects');
  subjects.find(params).toArray(function(err, docs) {
    if (err) deferred.reject(err);
    deferred.resolve(docs);
  });
  return deferred.promise;
};

module.exports = new MongoService();
