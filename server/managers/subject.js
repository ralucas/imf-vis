var _ = require('lodash');
var config = require('../../config');

var MongoClient = require('../services/mongo-client.js');

function SubjectManager() {}

function fullMax(dataset) {
 var newData = [];

  _.forEach(dataset, function(eachCountry) {
    newData = newData.concat(eachCountry.AnnualData);
  });

  return _.max(newData, function(data) {
    var num = data.Data.replace(/\,/,'');
    return parseInt(num);
  });
}

function countryAndYear(dataset, options) {
  options = options || {};

  var output = {},
      year = options.year.toString();
  if (!year && !options.ISO) {
    year = "2014";
  }

  var maximum;

  if (/Percent/.test(dataset[0].Units)) {
    maximum = 100;
  }

  // if the user clicks just on the country
  if (options.ISO) {
    return dataset;
  }

  var maxValue = maximum || parseInt(fullMax(dataset).Data.replace(/\,/,''));
  var splits = config.get('numberOfColors');

  _.forEach(dataset, function(eachCountry) {
    _.forEach(eachCountry.AnnualData, function(annualData) {
      if (year === annualData.Year) {
        var fillKey,
            parsedNum = parseFloat(annualData.Data.replace(/\,/,'')); 
         
        if (!annualData.Data || isNaN(parsedNum)) {
          fillKey = '0';
        } 

        var comp = parsedNum / maxValue;

        var reportData = {
          fillKey: fillKey || Math.ceil(comp * splits).toString(),
          num: parsedNum,
          comp: comp,
          data: annualData.Data || 'N/A',
          year: annualData.Year,
          country: eachCountry.Country,
          subject_code: eachCountry.WEO_Subject_Code,
          description: eachCountry.Subject_Descriptor
        };

        output[eachCountry.ISO] = reportData;
      }
    });
  });
  return output;
}

function byCountry(dataset) {
  var output = {
    reports: [],
    reportIds: []
  };
  _.forEach(dataset, function(report) {
    output.countryId = report.ISO;
    output.country = report.Country;
    output.reportIds.push(report.WEO_Subject_Code);
    output.reports.push({
      id: report.WEO_Subject_Code,
      data: report.AnnualData,
      description: report.Subject_Descriptor,
      units: report.Units,
      notes: report.Subject_Notes,
      scale: report.Scale,
      specific_notes: report.County_Series_Specific_Notes,
      estimates_start_after: report.Estimates_Start_After
    });
  });
  return output;
}


SubjectManager.prototype.find = function(params, options) {
  return MongoClient.find(params)
    .then(function(results) {
      if (params.ISO) {
        options.ISO = params.ISO;
      }
      return countryAndYear(results, options);
    }).fail(function(err) {
      return err;
    });
};

SubjectManager.prototype.findByCountry = function(params) {
  return MongoClient.find(params)
    .then(function(results) {
      return byCountry(results);
    }).fail(function(err) {
      return err;
    });
};

module.exports = new SubjectManager();
