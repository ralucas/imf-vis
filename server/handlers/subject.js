var SubjectManager = require('../managers/subject');

function SubjectHandler() {}

SubjectHandler.prototype.get = function(req, res, next) {
  var subjectCode = req.params.subjectCode,
      year        = req.query.year,
      countryId   = req.query.countryId,
      params      = {},
      options     = {};

  if (!subjectCode) res.status(400).send(new Error('WEO Subject Code required'));
  
  params.WEO_Subject_Code = subjectCode;
  
  if (year) {
    options.year = year;
  }
  
  if (countryId) {
    params.ISO = countryId;
  }

  SubjectManager.find(params, options)
    .then(function(results) {
      res.status(200).send(results);
    }).fail(function(err) {
      res.status(500).send(new Error('Error: ', err));
    });
};

SubjectHandler.prototype.getByCountry = function(req, res, next) {
  var countryId = req.params.countryId,
      params = {};

  if (!countryId) res.status(400).send(new Error('Country Id required'));

  params.ISO = countryId;

  SubjectManager.findByCountry(params)
    .then(function(results) {
      res.status(200).send(results);
    }).fail(function(err) {
      res.status(500).send(new Error('Error: ', err));
    });
};

module.exports = new SubjectHandler();
