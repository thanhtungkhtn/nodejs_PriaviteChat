// # SimpleServer
// A simple web server
var logger = require('morgan');
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var router = express();

var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + '/views'));

var server = http.createServer(app);
var request = require("request");

app.set('port', process.env.HEROKU_NODEJS_PORT || process.env.PORT || 8080);
app.set('ip', process.env.HEROKU_NODEJS_IP || process.env.IP || "0.0.0.0");

server.listen(app.get('port'), app.get('ip'), function() {
  console.log("Server listening at %s:%d ", app.get('ip'), app.get('port'));
});

app.get('/', (req, res) => {
    return res.render('index');
});