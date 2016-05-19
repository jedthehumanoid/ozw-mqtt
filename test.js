
var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://localhost');
var topicMatch = require('./tools').topicMatch;
client.request = require('./tools').request;

var onReply = require('./tools').onReply;

client.on('connect', function (topic, message) {
  client.request('server', 'pang', function (topic, message) {
    console.log('callback foshissle');
  });
  client.request('server', 'pang', function (topic, message) {
    console.log('callback rfsadf');
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
