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
    if (data.fillKey === 'defaultFill') {
      data.fillKey = '0';
    }
    _.forEach(data.AnnualData, function(year) {
      
      if (!year.Data || typeof(year.Data) === 'string') {
        data.fillKey = '0';
      } else {
        var comp = (year.Data / maxValue) * 100;
        data.fillKey = Math.ceil(comp / 12).toString();
      }
    });
    return data;
  }); 
};
