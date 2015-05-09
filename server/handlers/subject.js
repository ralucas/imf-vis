var MongoService = require('../services/mongo-service.js');

function SubjectHandler() {}

SubjectHandler.prototype.get = function(req, res, next) {
  var subjectCode = req.params.subjectCode,
      year        = req.params.year || false,
      params      = {};
      console.log(year);

  if (!subjectCode) res.status(400).send(new Error('WEO Subject Code required'));
  
  params.WEO_Subject_Code = subjectCode;
  if (year) params.AnnualData = {Year: year};

  MongoService.find(params)
    .then(function(results) {
      res.status(200).send(results);
    }).fail(function(err) {
      res.status(500).send(new Error('Database Error: ', err));
    });
};


module.exports = new SubjectHandler();
