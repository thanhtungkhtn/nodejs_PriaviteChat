// # SimpleServer
// A simple web server
var logger = require('morgan');
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var router = express();

// var fs = require("fs");
// var path = require("path");
// var mime = require("mime");

var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));

app.engine('html', require('ejs').renderFile);
app.set("view engine", "html");
// app.set("views", "./views");

var server = http.createServer(app);
var request = require("request");
const io = require("socket.io")(server);

app.set('port', process.env.HEROKU_NODEJS_PORT || process.env.PORT || 8080);
app.set('ip', process.env.HEROKU_NODEJS_IP || process.env.IP || "0.0.0.0");

server.listen(app.get('port'), app.get('ip'), function() {
  console.log("Server listening at %s:%d ", app.get('ip'), app.get('port'));
});

app.get('/', (req, res) => {
    return res.render('index');
    //return res.end("ok");
});

app.get('/messenger', function (req, res) {
  res.render('messenger');
})

io.on("connection", function(socket) {

  socket.on("user_join", function(data) {
      this.username = data;
      socket.broadcast.emit("user_join", data);
  });

  socket.on("chat_message", function(data) {
      data.username = this.username;
      socket.broadcast.emit("chat_message", data);
  });

  socket.on("disconnect", function(data) {
      socket.broadcast.emit("user_leave", this.username);
  });
});

