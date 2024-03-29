'use strict';

var _ = require('lodash');
var fs = require('fs');
var minimist = require('minimist');

function topicMatch (topic, match) {
  topic = topic.split('/');
  match = match.split('/');

  for (let i = 0; i < match.length; i++) {
    if (match[i] === '+') {
    } else if (match[i] === '#') {
      return true;
    } else if (topic[i] !== match[i]) {
      return false;
    }
  }
  return true;
}

function request (request, message, callback) {
  var id = Date.now();

  this.subscribe(request + '/response/client/' + id);
  request = request + '/request/client/' + id;

  if (this.callbacks === undefined) {
    this.callbacks = [];
  }

  this.callbacks.push(callback);
  this.publish(request, message);
}

function onReply (topic, message) {
  var callback = this.callbacks.shift();

  this.unsubscribe(topic);
  callback(message);
}

function fahrenheitToCelsius (temp) {
  temp = (temp - 32) * 5 / 9;
  temp = temp.toFixed(2);
  return temp;
}

function convertSI (value) {
  if (value.label === 'Temperature' && value.units === 'F') {
    value.value = fahrenheitToCelsius(value.value);
  }
  return value;
}

function readConfiguration (defaultfile, options) {
  var config;

  if (options === undefined) {
    options = {};
  }
  config = minimist(process.argv.slice(2), options);

  if (_.isString(config.config) && !_.isEmpty(config.config)) {
    try {
      config = JSON.parse(fs.readFileSync(config.config, 'utf8'));
    } catch (e) {
      console.log('Error reading ' + config.config + ': ' + e);
      process.exit();
    }
  } else {
    try {
      config = JSON.parse(fs.readFileSync(defaultfile, 'utf8'));
    } catch (e) {
    }
  }

  _.assign(options.default, config);

  config = minimist(process.argv.slice(2), options);
  console.log('configuration:');
  console.log(JSON.stringify(config, null, 2));
  return config;
}

exports.topicMatch = topicMatch;
exports.request = request;
exports.onReply = onReply;
exports.fahrenheitToCelsius = fahrenheitToCelsius;
exports.convertSI = convertSI;
exports.readConfiguration = readConfiguration;
