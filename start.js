#!/usr/bin/env node

'use strict';

var tools = require('./tools');
var OZW = require('openzwave-shared');
var mqtt = require('mqtt');

var defaultconfig = {
  usbport: '/dev/ttyACM0',
  broker: 'mqtt://localhost'
};

var config = tools.readConfiguration('config.json', {default: defaultconfig, alias: {config: 'c'}});

var zwave = new OZW({ConsoleOutput: false});
var client = mqtt.connect(config.broker);
var nodes = [];

function debugMessage (message) {
  client.publish('zwave/debug', message);
  console.log(message);
}

zwave.on('driver ready', function (homeid) {
  debugMessage('Driver ready, scanning homeid: ' + homeid);
});

zwave.on('driver failed', function () {
  debugMessage('Driver failed');
  zwave.disconnect();
  process.exit();
});

zwave.on('scan complete', function () {
  debugMessage('Scan complete');
});

zwave.on('node added', function (nodeid) {
  debugMessage('Adding node: ' + nodeid + '...\n');
  nodes[nodeid] = {
    classes: {},
    ready: false
  };
});

zwave.on('value added', function (nodeid, comclass, value) {
  var message;
  var time = new Date().toISOString();

  value = tools.convertSI(value);

  message = {
    info: 'value added',
    node: value.node_id,
    label: value.label,
    value: value.value,
    timestamp: time
  };

  client.publish('zwave/value', JSON.stringify(message));
  if (!nodes[nodeid]['classes'][comclass]) {
    nodes[nodeid]['classes'][comclass] = {};
  }
  nodes[nodeid]['classes'][comclass][value.index] = value;
});

zwave.on('value changed', function (nodeid, comclass, value) {
  var message;
  var time = new Date().toISOString();

  value = tools.convertSI(value);

  message = {
    info: 'value changed',
    node: value.node_id,
    label: value.label,
    value: value.value,
    timestamp: time
  };

  client.publish('zwave/value', JSON.stringify(message));
  nodes[nodeid]['classes'][comclass][value.index] = value;
});

zwave.on('node ready', function (nodeid, nodeinfo) {
  var values;

  nodes[nodeid].info = nodeinfo;
  nodes[nodeid]['ready'] = true;

  console.log('node' + nodeid + ': ' + nodeinfo.manufacturer + ' ' + nodeinfo.product);

  for (let comclass in nodes[nodeid]['classes']) {
    switch (comclass) {
      case 0x25: // COMMAND_CLASS_SWITCH_BINARY
      case 0x26: // COMMAND_CLASS_SWITCH_MULTILEVEL
        zwave.enablePoll(nodeid, comclass);
        break;
    }
    values = nodes[nodeid]['classes'][comclass];
    console.log('node%d: class %d', nodeid, comclass);
    for (let idx in values) {
      console.log('node' + nodeid + ': ' + values[idx].label + '=' + values[idx].value);
    }
  }
});

client.on('message', function (topic, message) {
  console.log(message.toString());
});

process.on('SIGINT', function () {
  console.log('disconnecting...');
  zwave.disconnect(config.usbport);
  client.end();
  process.exit();
});

client.on('connect', function () {
  // client.subscribe('presence');
  // client.publish('presence', 'Hello mqtt');
});

console.log('connecting...');
zwave.connect(config.usbport);
