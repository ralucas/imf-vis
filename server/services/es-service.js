var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace',
  deadTimeout: 600000,
  maxRetries: 100,
  pingTimeout: 100000,
  requestTimeout: 600000
});

client.ping({
  // ping usually has a 3000ms timeout 
  requestTimeout: Infinity,
 
  // undocumented params are appended to the query string 
  hello: "elasticsearch!"
}, function (error) {
  if (error) {
    console.trace('Error: elasticsearch cluster is down!');
  } else {
    console.log('All is well');
  }
});

module.exports = client;
