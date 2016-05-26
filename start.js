#!/usr/bin/env node

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

zwave.on('driver ready', function (homeid) {
  console.log('Scanning homeid: ' + homeid);
});

zwave.on('driver failed', function () {
  console.log('driver failed');
  zwave.disconnect();
  process.exit();
});

zwave.on('scan complete', function () {
  console.log('scan complete');
});

zwave.on('node added', function (nodeid) {
  client.publish('zwave/message', 'Adding node: ' + nodeid + '...\n');
  nodes[nodeid] = {
    classes: {},
    ready: false
  };
});

zwave.on('value added', function (nodeid, comclass, value) {
  value = tools.convertSI(value);

  var time = new Date().toISOString();

  var message = {
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
  value = tools.convertSI(value);

  var time = new Date().toISOString();

  var message = {
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
  nodes[nodeid].info = nodeinfo;
  nodes[nodeid]['ready'] = true;
  console.log('node%d: %s, %s', nodeid,
  nodeinfo.manufacturer ? nodeinfo.manufacturer
  : 'id=' + nodeinfo.manufacturerid,
  nodeinfo.product ? nodeinfo.product
  : 'product=' + nodeinfo.productid +
  ', type=' + nodeinfo.producttype);
  console.log('node%d: name="%s", type="%s", location="%s"', nodeid,
  nodeinfo.name,
  nodeinfo.type,
  nodeinfo.loc);
  for (var comclass in nodes[nodeid]['classes']) {
    switch (comclass) {
      case 0x25: // COMMAND_CLASS_SWITCH_BINARY
      case 0x26: // COMMAND_CLASS_SWITCH_MULTILEVEL
        zwave.enablePoll(nodeid, comclass);
        break;
    }
    var values = nodes[nodeid]['classes'][comclass];
    console.log('node%d: class %d', nodeid, comclass);
    for (var idx in values) {
      console.log('node%d:   %s=%s', nodeid, values[idx]['label'], values[idx]['value']);
    }
  }
});

console.log('connecting...');
zwave.connect(config.usbport);

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

client.on('message', function (topic, message) {
  console.log(message.toString());
});
