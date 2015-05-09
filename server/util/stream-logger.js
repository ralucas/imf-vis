var fs = require('fs');

module.exports = function(filePath) {
  var file = fs.createWriteStream(filePath);

  process.stdin.setEncoding('utf8');

  process.stdin.on('readable', function() {
    var chunk = process.stdin.read();
    if (chunk !== null) {
      file.write('data: ' + chunk);
    }
  });

  process.stdin.on('end', function() {
    file.write('end');
  });
};
