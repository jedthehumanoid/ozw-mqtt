var OZW = require('openzwave-shared');
var zwave = new OZW({ConsoleOutput: false});

var nodes = [];

zwave.on('driver ready', function(homeid){
  console.log('driver ready foshizzle');
  console.log(homeid);
});

zwave.on('driver failed', function(){
  console.log('wtf driver failed');
});

zwave.on('scan complete', function(){
  console.log('scan complete foshizzle');
});

zwave.on('node added', function(nodeid) {
    console.log('Adding node: ' + nodeid + '...');
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
        ready: false,
    };
});

zwave.on('value added', function(nodeid, comclass, value) {
  console.log('value added');
  console.log('-----------');
  console.log(value.node_id);
  console.log(value.label);
  console.log(value.value);
  console.log('');

    if (!nodes[nodeid]['classes'][comclass])
        nodes[nodeid]['classes'][comclass] = {};
    nodes[nodeid]['classes'][comclass][value.index] = value;
});

zwave.on('value changed', function(nodeid, comclass, value) {
  console.log('value changed');
  console.log('-------------');
  console.log(value.node_id);
  console.log(value.label);
  console.log(value.value);
  console.log('');

    if (nodes[nodeid]['ready']) {
        console.log('node%d: changed: %d:%s:%s->%s', nodeid, comclass,
                value['label'],
                nodes[nodeid]['classes'][comclass][value.index]['value'],
                value['value']);
    }
    nodes[nodeid]['classes'][comclass][value.index] = value;
});

/*
zwave.on('node naming', function(nodeid, nodeinfo){
  console.log('node naming');
  console.log(nodeid);
  console.log(nodeinfo);
});

zwave.on('node available', function(nodeid, nodeinfo){
  console.log('node avaliable');
  console.log(nodeid);
  console.log(nodeinfo);
})
*/
zwave.on('node ready', function(nodeid, nodeinfo) {
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
    for (comclass in nodes[nodeid]['classes']) {
        switch (comclass) {
        case 0x25: // COMMAND_CLASS_SWITCH_BINARY
        case 0x26: // COMMAND_CLASS_SWITCH_MULTILEVEL
            zwave.enablePoll(nodeid, comclass);
            break;
        }
        var values = nodes[nodeid]['classes'][comclass];
        console.log('node%d: class %d', nodeid, comclass);
        for (idx in values)
            console.log('node%d:   %s=%s', nodeid, values[idx]['label'], values[idx]['value']);
    }
});

console.log('connecting...');
zwave.connect('/dev/ttyACM0');

process.on('SIGINT', function() {
    console.log('disconnecting...');
    console.log(JSON.stringify(nodes, null, 2));

    zwave.disconnect('/dev/ttyUSB0');
    process.exit();
});
