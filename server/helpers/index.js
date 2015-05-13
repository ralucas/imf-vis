var _ = require('lodash');
var config = require('../../config');

function max(dataset, year) {
  var newData = [];

  _.forEach(dataset, function(eachCountry) {
    _.forEach(eachCountry.AnnualData, function(annual) {
      if (annual.Year === year) {
        newData.push(annual);
      }
    });
  });

  return _.max(newData, function(data) {
    var num = data.Data.replace(/\,/,'');
    return parseInt(num);
  });
}

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

// Based on percentile level
exports.determineFill = function(dataset, year, maximum) {
  //maximum isn't guaranteed
  var maxValue = maximum || parseInt(fullMax(dataset).Data.replace(/\,/,''));
  var splits = config.get('numberOfColors');
  console.log('max: ', maxValue);
  _.forEach(dataset, function(data) {
    if (data.fillKey === 'defaultFill') {
      data.fillKey = '0';
    }
    _.forEach(data.AnnualData, function(year) {
      var parsedNum = parseFloat(year.Data.replace(/\,/,'')); 
      if (!year.Data || isNaN(parsedNum)) {
        data.fillKey = '0';
      } else {
        var comp = parsedNum / maxValue;
        data.num = parsedNum;
        data.comp = comp;
        data.fillKey = Math.ceil(comp * splits).toString();
      }
    });
    return data;
  }); 
};
