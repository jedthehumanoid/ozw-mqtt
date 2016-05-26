#!/usr/bin/env node

var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://localhost');
var tools = require('./tools');
var https = require('https');

client.on('connect', function () {
  client.subscribe('+/message');
  client.subscribe('+/value');
});

client.on('message', function (topic, message) {
  var options, path;
  console.log(topic);
  if (tools.topicMatch(topic, '+/value/#')) {
    message = JSON.parse(message.toString());
    console.log(message);
    if (message.label === 'Temperature') {
      path = '/update?api_key=I4EXCOV9VGR5OLF3&field1=' + message.value;
      options = {
        hostname: 'api.thingspeak.com',
        path: path
      };
      https.request(options, function (response) {
        console.log('posted temperature');
      }).end();
    }
    if (message.label === 'Relative Humidity') {
      path = '/update?api_key=I4EXCOV9VGR5OLF3&field2=' + message.value;
      options = {
        hostname: 'api.thingspeak.com',
        path: path
      };

      https.request(options, function (response) {
        console.log('posted humidity');
      }).end();
    }
  } else {
    message = message.toString();
    console.log(message);
  }
});
