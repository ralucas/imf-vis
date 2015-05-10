var _ = require('lodash');

var fillLevels = {

};

function max(dataset) {
  var newData = [];

  _.forEach(dataset, function(eachCountry) {
    newData = newData.concat(eachCountry.AnnualData);
  });

  return _.max(newData, function(data) {
    return data.Data;
  });
}

// Based on percentile level
exports.determineFill = function(dataset, maximum) {
  //maximum isn't guaranteed
  var maxValue = maximum || max(dataset).Data;

  _.forEach(dataset, function(data) {
    _.forEach(data.AnnualData, function(year) {
      if (year.Year === 2014) {
        if (typeof(year.Data) === 'string') {
          data.fillKey = 'defaultFill';
        } else {
          var comp = year.Data / maxValue;

          if (comp < 0.33) {
            data.fillKey = 'LOW';
          } else if (0.34 < comp < 0.67) {
            data.fillKey = 'MEDIUM';
          } else if (0.67 < comp) {
            data.fillKey = 'HIGH';
          }
        }
      }  
    });
    return data;
  }); 
};
