#!/usr/bin/env node

var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://localhost');

client.on('connect', function () {
  client.subscribe('+/message');
  client.subscribe('+/value');

  // client.publish('presence', 'Hello mqtt');
});

client.on('message', function (topic, message) {
  message = message.toString();
  console.log(message);
});
