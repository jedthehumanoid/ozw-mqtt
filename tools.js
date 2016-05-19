function topicMatch (topic, match) {
  topic = topic.split('/');
  match = match.split('/');

  for (var i = 0; i < match.length; i++) {
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
  this.unsubscribe(topic);
  var callback = this.callbacks.shift();
  callback.apply(this, arguments);
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

exports.topicMatch = topicMatch;
exports.request = request;
exports.onReply = onReply;
exports.fahrenheitToCelsius = fahrenheitToCelsius;
exports.convertSI = convertSI;
