var mqtt = require('mqtt');
var topicMatch = require('./tools').topicMatch;
var tools = require('./tools');
var client = mqtt.connect('mqtt://localhost');
var config = tools.readConfiguration('config.json');
var onReply = require('./tools').onReply;

client.request = require('./tools').request;

console.log(config);

client.on('connect', function (topic, message) {
  client.request('server', 'pang', function (message) {
    console.log('callback foshissle');
  });
  client.request('server', 'pang', function (message) {
    console.log(message.toString());
  });
});

client.on('message', function (topic, message) {
  if (topicMatch(topic, '+/response/#')) {
    onReply.apply(this, arguments);
  }
});

process.on('SIGINT', function () {
  client.end();
  process.exit();
});
