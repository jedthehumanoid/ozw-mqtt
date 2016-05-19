#!/usr/bin/env node

var OZW = require('openzwave-shared');
var zwave = new OZW({ConsoleOutput: false});

var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://localhost');

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
    manufacturer: '',
    manufacturerid: '',
    product: '',
    producttype: '',
    productid: '',
    type: '',
    name: '',
    loc: '',
    classes: {},
    ready: false
  };
});

zwave.on('value added', function (nodeid, comclass, value) {
  if (value.label === 'Temperature' && value.units === 'F') {
    value.value = (value.value - 32) * 5 / 9;
    value.value = value.value.toFixed(2);
  }

  var message = {
    info: 'value added',
    node: value.node_id,
    label: value.label,
    value: value.value
  };
  console.log('added');
  console.log(value);

  client.publish('zwave/value', JSON.stringify(message));
  if (!nodes[nodeid]['classes'][comclass]) {
    nodes[nodeid]['classes'][comclass] = {};
  }
  nodes[nodeid]['classes'][comclass][value.index] = value;
});

zwave.on('value changed', function (nodeid, comclass, value) {
  if (value.label === 'Temperature' && value.units === 'F') {
    value.value = (value.value - 32) * 5 / 9;
    value.value = value.value.toFixed(2);
  }

  var message = {
    info: 'value changed',
    node: value.node_id,
    label: value.label,
    value: value.value
  };
  console.log('changed');
  console.log(value);

  client.publish('zwave/value', JSON.stringify(message));

  if (nodes[nodeid]['ready']) {
    console.log('node%d: changed: %d:%s:%s->%s', nodeid, comclass,
    value['label'],
    nodes[nodeid]['classes'][comclass][value.index]['value'],
    value['value']);
  }
  nodes[nodeid]['classes'][comclass][value.index] = value;
});

zwave.on('node ready', function (nodeid, nodeinfo) {
  nodes[nodeid]['manufacturer'] = nodeinfo.manufacturer;
  nodes[nodeid]['manufacturerid'] = nodeinfo.manufacturerid;
  nodes[nodeid]['product'] = nodeinfo.product;
  nodes[nodeid]['producttype'] = nodeinfo.producttype;
  nodes[nodeid]['productid'] = nodeinfo.productid;
  nodes[nodeid]['type'] = nodeinfo.type;
  nodes[nodeid]['name'] = nodeinfo.name;
  nodes[nodeid]['loc'] = nodeinfo.loc;
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

client.publish('message', 'connecting...');
zwave.connect('/dev/ttyACM0');

process.on('SIGINT', function () {
  console.log('disconnecting...');
  console.log(JSON.stringify(nodes, null, 2));

  zwave.disconnect('/dev/ttyUSB0');
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
