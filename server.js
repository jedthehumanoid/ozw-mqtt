var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://localhost');

client.on('connect', function () {
  console.log('listening to server/request/#...');
  client.subscribe('server/request/#');
});

client.on('message', function (topic, message) {
  console.log('request: ' + topic + ' ' + message);
  topic = topic.split('/').slice(2).join('/');
  client.publish('server/response/' + topic, message + ' - pong');
});

process.on('SIGINT', function () {
  client.end();
  process.exit();
});
