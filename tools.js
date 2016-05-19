function topicMatch (topic, match) {
  topic = topic.split('/');
  match = match.split('/');

  for (var i = 0; i < match.length; i++) {
    console.log(topic[i] + ' = ' + match[i]);
    if (match[i] === '+') {
    } else if (match[i] === '#') {
      return true;
    } else if (topic[i] !== match[i]) {
      return false;
    }
  }
  return true;
}

exports.topicMatch = topicMatch;
