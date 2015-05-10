var _ = require('lodash');

var helpers = require('../helpers');
var MongoService = require('../services/mongo-service.js');

function SubjectManager() {}

function countryAndYear(dataset, options) {
  options = options || {};

  var output = {},
      year = parseInt(options.year);
  if (!year && !options.ISO) {
    year = 2014;
  }

  var maximum;
  if (/Percent/.test(dataset[0].Units)) {
    maximum = 100;
  }

  helpers.determineFill(dataset, maximum);

  if (options.ISO) {
    return dataset;
  }

  _.forEach(dataset, function(eachCountry) {
    _.forEach(eachCountry.AnnualData, function(annualData) {
      if (year === annualData.Year) {
        var reportData = {
          fillKey: eachCountry.fillKey, 
          data: annualData.Data || 'N/A',
          year: annualData.Year,
          country: eachCountry.Country,
          subject_code: eachCountry.WEO_Subject_Code,
          desciption: eachCountry.Subject_Descriptor
        };

        output[eachCountry.ISO] = reportData;
      }
    });
  });
  return output;
}


SubjectManager.prototype.find = function(params, options) {
  return MongoService.find(params)
    .then(function(results) {
      if (params.ISO) {
        options.ISO = params.ISO;
      }
      return countryAndYear(results, options);
    }).fail(function(err) {
      return err;
    });
};

module.exports = new SubjectManager();
