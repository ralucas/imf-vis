var _ = require('lodash');

var fillLevels = {

};

function max(dataset) {
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
exports.determineFill = function(dataset, maximum) {
  //maximum isn't guaranteed
  var maxValue = maximum || parseInt(max(dataset).Data.replace(/\,/,''));

  _.forEach(dataset, function(data) {
    if (data.fillKey === 'defaultFill') {
      data.fillKey = '0';
    }
    _.forEach(data.AnnualData, function(year) {
      var parsedNum = parseInt(year.Data.replace(/\,/,'')); 
      if (!year.Data || isNaN(parsedNum)) {
        data.fillKey = '0';
      } else {
        var comp = (parsedNum / maxValue) * 100;
        data.fillKey = Math.ceil(comp / 12).toString();
      }
    });
    return data;
  }); 
};
