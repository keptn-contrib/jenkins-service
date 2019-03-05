// server.js
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

// parse application/json
app.use(bodyParser.json())

var jenkinsOperator = require('../operator.js').jenkinsNotificationListener;

app.post('/jenkinsOperator', jenkinsOperator);

app.post('/', function(req, res) {
  console.log(req);
  //const pubsubPayload = JSON.parse(base64decode(req.body.Data));
  const pubsubPayload = req.body;
  if (pubsubPayload.channel === 'jenkins') {
    jenkinsOperator(pubsubPayload, res);
  }
});

app.get('/health', function (req, res, next) {
  res.sendStatus(200)
});

var server = app.listen(process.env.PORT || 8079, function () {
  var port = server.address().port;
  console.log("Keptn-Operator now running in %s mode on port %d", app.get("env"), port);
});