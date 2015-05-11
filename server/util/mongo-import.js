
var path = require('path');
var fs = require('fs');

var csv = require('csv');
var parse = csv.parse;
var _ = require('lodash');
var mongoose = require('mongoose');

var db = require('../services/mongo-service.js');
var Country = require('../models/country.js');
var Subject = require('../models/subject.js');

var csvPath = path.join(__dirname, '../../data/WEOOct2014all.csv');

var csvFile = fs.readFileSync(csvPath);

var docs = [];

var parseCountries = function() {
  parse(csvFile, function(err, output) {
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
      }

      var annualData = mapYears([years, data.slice(9)]);

      doc = {
        WEO_Country_Code: data[0],
        ISO: data[1],
        Country: data[3]
      };

      subjects.push({
        WEO_Subject_Code: data[2],
        Subject_Descriptor: data[4],
        Subject_Notes: data[5],
        Units: data[6],
        Scale: data[7],
        Country_Series_Specific_Notes: data[8],
        AnnualData: annualData          
      });

    });

  });
};

var parseSubjects = function() {

  parse(csvFile, function(err, output) {
    var headers = [];
    var ogHeaders = output.shift();
    
    _.forEach(ogHeaders, function(header, idx) {
      header.replace(/\s/, '_');
      headers.push(header);
    });
    var years = headers.slice(9, headers.length-2);

    var currCode,
        doc = {},
        id = 1000;
   
    _.forEach(output, function(data) {
      var len = data.length;
    
      var annualData = mapYears([years, data.slice(9, len-2)]);

      doc = {
        WEO_Country_Code: data[0],
        ISO: data[1],
        Country: data[3],
        WEO_Subject_Code: data[2],
        Subject_Descriptor: data[4],
        Subject_Notes: data[5],
        Units: data[6],
        Scale: data[7],
        Country_Series_Specific_Notes: data[8],
        Estimates_Start_After: data[len-1],
        AnnualData: annualData          
      };
      docs.push(doc);
    });
  });
};

function mapYears(arr) {
  var output = [];
  
  _.forEach(arr[0], function(el, idx) {
    output.push({
      Year: el,
      Data: arr[1][idx]
    });
  });

  return output;
}

parseSubjects();

var start = 0;
var end = 1000;
var count = 0;

var interval = setInterval(function() {
  var add = 1000;
  var exit = false;

  if (docs.length < 1) {
    console.log('---End---');
    process.exit(0);
  }

  if (docs.length < 1000) {
    end = add = docs.length;
    console.log('Last Insert of ' + end + ' documents...');
    exit = true;
    clearInterval(interval);
  }

  console.log('Docs %d - %d attempted', count, (count + add));
  
  count += 1000;

  var insert = docs.slice(start, end);

  Subject.collection.insert(insert, function(err, res) {
    if (err) {
      console.error('Error on mongo insert: ', err, err.stack);
      process.exit(1);
    } else {
      console.log('Success!');
    }
  });

  docs.splice(start, end);

  if (exit) {
    console.log('Goodbye');
    process.exit(0);
  }

}, 5000);


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


