var socket = io.connect();

var $messageForm = $('#send-message');
var $messageBox = $('#message');
var $chat = $('.chat');

var $nickForm = $('#setNick');
var $nickError = $('#nickError');
var $nickBox = $('#nickName');
var $users = $('.users');

var yourself = '';
var username = '';

var listuser = {};


function amIclicked(e, element, socket)
{
e = e || event;
var target = e.target || e.srcElement;
if(target.id==element.id)
    return true;
else
    return false;
}
function oneClick(event, element)
{
if(amIclicked(event, element))
{
    alert('Let select user to chat.!');
}
}

async function twoClick(event, element, socket)
{
if(amIclicked(event, element, socket))
{
 //   socket.leave(socket.rooms);
    username = $(element).text();
    // alert(username);
    //console.log(socket.id);
    alert("Type your message in massage box: " + username)

    await socket.emit('set private room',{
        current_room: socket.id, // cua may
        name: username,

        room: username + '-' + yourself
    });
    
}
}

$messageForm.submit(async function(e){
e.preventDefault();

// socket.join(found.id);

await socket.emit('send private message',{
    //toid: found.id,
    from: yourself,
    to : username,
    message :  $messageBox.val() //message
}, function (data) {
    $chat.append('<span class="error">' + data + '</span><br/>');
    } );


if($messageBox.val() !== '' && !_.isEmpty($messageBox.val().trim())){
    console.log(username);

    $chat.append('<span class="msg">Gui toi <b>' + username + ': </b>' + $messageBox.val() + '</span><br/>');
}

$messageBox.val('').focus();
});

/*Received private messages*/
socket.on('recived message',function(data){
var form = data.form;
var username = data.username;
var message = data.message;
var time = data.time;

console.log(username+': '+message + time);
// alert(username+': '+message);

$chat.append('<span class="whisper"><b>' + form + ' sent: </b>' + message + ' at ' + time +'</span><br/>');
$chat.scrollTop(350);

});



$nickForm.submit(function(e){
e.preventDefault();

socket.emit('new user', $nickBox.val(), function(data){
    if(data){
        
        $('#nickWrap').hide();
        $('.contentWrap').show();

    } else {
        $nickError.html('That username is already taken. Try again!');
        // innerHTML
    }
})
yourself =  $nickBox.val();
$nickBox.val('')
});

socket.on('usernames', function(usernames){
listuser = usernames;
// console.log(listuser);
var people = '';
console.log(yourself);
for (i = 0; i < usernames.length; i++){
    if(usernames[i] === yourself){
        continue;
    }
    people += '<div class="user-item" onclick="twoClick(event, this, socket);">' + usernames[i] + '</div>'
}

$users.html(people);
})