#!/usr/bin/env node

var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://localhost');
var tools = require('./tools');
var https = require('https');
var apikey = process.env.ts_apikey

client.on('connect', function () {
  client.subscribe('+/message');
  client.subscribe('+/value');
});

client.on('message', function (topic, message) {
  var options, path;

  if (tools.topicMatch(topic, '+/value/#')) {
    console.log(message.toString());
    message = JSON.parse(message.toString());

    if (message.label === 'Temperature') {
      path = '/update?api_key=' + apikey + '&field1=' + message.value;
      options = {
        hostname: 'api.thingspeak.com',
        path: path
      };
      https.request(options, function (response) {
        console.log('posted temperature');
      }).end();
    }
    if (message.label === 'Relative Humidity') {
      path = '/update?api_key=' + apikey + '&field2=' + message.value;
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
