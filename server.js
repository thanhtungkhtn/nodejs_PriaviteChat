// # SimpleServer
// A simple web server
var logger = require('morgan');
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var router = express.Router();
var request = require("request");
var session = require('express-session');
var path = require("path");
var mysql = require("mysql");
var app = express();
var _ = require('lodash');

var routes = require('./routers');
var user = require('./routers/user');
var func = require('./routers/func');


var server = require('http').createServer(app);
// var io = require('socket.io').listen(server);
var io = require('socket.io')(server);
var users = {};
var connectedUsers = []; // nicknames = [];

// var fs = require("fs");
// var mime = require("mime");

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'root',
	database : 'reason_api'
});
// connection.connect();
connection.connect(function(err){
  if(!err) {
      console.log("Database is connected ... nn");
  } else {
      console.log("Error connecting database ... nn");
  }
});

global.db = connection;

app.set('port', process.env.HEROKU_NODEJS_PORT || process.env.PORT || 3333);
app.set('ip', process.env.HEROKU_NODEJS_IP || process.env.IP || "0.0.0.0");

// app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');


app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// add router
app.use('/', router);

// app.use(express.static(__dirname + '/views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(__dirname + '/profile-template'));

app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));

/*-------------------------------------------------------*/
/*Router */ //module.exports = router;

app.get('/', routes.index); // main page // login

app.get('/login', user.login);
app.post('/login', user.login);//call for login post

app.get('/signup', user.signup);
app.post('/signup', user.signup);//call for signup post

app.get('/home/dashboard', user.dashboard);
app.get('/home/profile',user.profile);//to render users profile

app.get('/home/logout', user.logout);//call for logout

//   // res.sendFile(path.join(__dirname+'/home.html'));
//   //__dirname : It will resolve to your project folder.

/* Messenger */
app.get('/messenger', func.messenger);

/* My Profile */
app.get('/about', func.about);

/*-------------------------------------------------------*/
io.on("connection", (socket) => {
  
  // ----------------------Chat Room------------------ //

  // socket.on("user_join", function(data) {
  //     this.username = data;
  //     socket.broadcast.emit("user_join", data);
  // });

  // socket.on("chat_message", function(data) {
  //     data.username = this.username;
  //     socket.broadcast.emit("chat_message", data);
  // });

  // socket.on("disconnect", function(data) {
  //     socket.broadcast.emit("user_leave", this.username);
  // });
  
  // ----------------------Private Message------------------ //

  var previousRoomID = socket.id; //data.current_room;

  socket.on('new user', function(data, callback){
   // console.log(`${socket.id} connected!`);

    if(data in users || _.isEmpty(data.trim())){
        // callback({isvalid : false});
        callback(false);
    } else {
        callback(true);
        socket.nickname = data;
        users[socket.nickname] = socket;

        updateNickNames();
    }
  });

  function updateNickNames(){
    io.sockets.emit('usernames', Object.keys(users));
  }

  socket.on('set private room', async (data)=>{

    socket.leave(previousRoomID);
   
    await socket.join(users[data.name].id);

    previousRoomID = users[data.name].id;
  });

   /* Private chat */
   socket.on('send private message' , async function(data,callback){
    var form = data.from,
      to = data.to,
      message = data.message;
    
    if (!_.isEmpty(message) && !_.isEmpty(message.trim())){ //có ít nhất một ký tự chữ và số
        if(users.hasOwnProperty(to)){ //to in users
        
          await users[to].emit('recived message',{
                //The sender's username
                form: form,
                username : to,
                //Message sent to receiver
                message : message,
                time: new Date().toISOString()
            });

        } else {
            callback('Error! Enter a valid user.')
        }
    } else{
        callback('Error!, Please enter a message for your friend.')
    }
  }); 


  socket.on('disconnect', function(data){
    if(!socket.nickname) return;

    delete users[socket.nickname];

    //nicknames.splice(nicknames.indexOf(socket.nickname), 1);
    updateNickNames();
  });
});

server.listen(app.get('port'), app.get('ip'), function() {
  console.log("Server listening at %s:%d ", server.address().address, server.address().port);
});


// /*-------------------------------------------------------*/
// /* Login */
// router.get('/auth', (req, res) => {
//   return res.render('login');
//   //return res.end("ok");
//   //res.sendFile(path.join(__dirname + '/views/login.html'));
// });

// app.post('/auth', function(request, response) {
// 	var username = request.body.username;
// 	var password = request.body.password;
// 	if (username && password) {
// 		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
// 			if (results.length > 0) {
// 				request.session.loggedin = true;
// 				request.session.username = username;
// 				response.redirect('/');
// 			} else {
// 				response.send('Incorrect Username and/or Password!');
// 			}			
// 			response.end();
// 		});
// 	} else {
// 		response.send('Please enter Username and Password!');
// 		response.end();
// 	}
// });

// /*-------------------------------------------------------*/