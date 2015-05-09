var path = require('path');
var fs = require('fs');

var csv = require('csv');
var parse = csv.parse;
var _ = require('lodash');

var db = require('../services/es-service.js');

var csvPath = path.join(__dirname, '../../data/WEOOct2014all.csv');

var csvFile = fs.readFileSync(csvPath);

var docs = [];

//logger
require('./stream-logger.js')(path.join(__dirname, '../../logs/stdin.log'));

parse(csvFile, function(err, output) {
  //var deferred = Q.defer();

  var headers = [];
  var ogHeaders = output.shift();
  
  _.forEach(ogHeaders, function(header, idx) {
    header.replace(/\s/, '_');
    headers.push(header);
  });

  var years = headers.slice(9);

  var currCode,
      doc = {},
      subjects = [];
 
  _.forEach(output, function(data) {
    if (!currCode) currCode = data[0];
    if (currCode !== data[0]) {
      currCode = data[0];

      _.assign(doc, {'Subjects': subjects});
      docs.push(doc);
      //db.create(doc, function(err, res) {
        //if (err) console.error('Error in seeding ElasticSearch: ', err, err.stack);
        //console.log('response:', res);
      //});
    }

    var annualData = mapYears([years, data.slice(9)]);

    doc = {
      'index': 'country',
      'type': 'documents',
      'id': data[0],
      'WEO_Country_Code': data[0],
      'ISO': data[1],
      'Country': data[3]
    };

    subjects.push({
      'WEO_Subject_Code': data[2],
      'Subject_Descriptor': data[4],
      'Subject_Notes': data[5],
      'Units': data[6],
      'Scale': data[7],
      'Country/Series-specific_Notes': data[8],
      'AnnualData': annualData          
    });

  });
  //deferred.resolve(docs);

  //return deferred.promise;

});

function mapYears(arr) {
  var output = [];
  
  _.forEach(arr[0], function(el, idx) {
    var year = {};
    year[el] = arr[1][idx]; 
    output.push(year);
  });

  return output;
}

setTimeout(function() {
  console.log(docs[3]);
  var test = docs[3];
  db.create(test, function(err, res) {
    if (err) {
      console.error('Error in Testing: ', err, err.stack);
      process.exit(1);
    } else {
      console.log('resp:', res);
    }
  });
}, 20000);

/*
 * Potential Redis Structure
{
  CountryCode: {
    Name: String,
    SubjectCode : {
      Data: [{
        Year: Number,
        Data: Data
      }],
      Notes: String,
      Etc_data: Strings
    }
  }
}
**/


