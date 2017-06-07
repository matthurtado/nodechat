var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
var users = [];
var motd = 'Welcome to socket.io chat<br/>Type /help for commands';
io.on('connection', function(socket){
    console.log('user connected: ' + socket.client.id);
    socket.emit('server message', {username: 'server', message: motd});
    users.push({socketId: socket.client.id, username: socket.client.id});

    // User disconnect
    socket.on('disconnect', function(){
        console.log('user disconnected');

        var message = {
            username: 'server', 
            message: users[findIndex(socket.client.id)].username + ' disconnected'};
        users.splice(findIndex(socket.client.id), 1);
        io.emit('server message', message);
    });

    // Change username
    socket.on('addUsername', function(username){
        console.log('Attempting to set username ' + username + ' for socketId: ' + socket.client.id);
        if(username.startsWith('/username ')){
            username = username.split('/username')[1].trim();
        }
        console.log(findUsername(username));
        if(findUsername(username) >= 0){
            socket.emit('server message', {username: 'SERVER', message: 'username already exists'});
        }
        else{
            socket.emit('server message', {username: 'SERVER', message: 'username changed successfully'});
            socket.broadcast.emit('server message', 
            {username: 'server', message: users[findIndex(socket.client.id)].username + ' changed username to: ' + username});
            updateUsername( {sock:socket.client.id,value:username});
        }
    });

    // Message received
    socket.on('chat message', function(msg){
        console.log(socket.client.id + ': ' + 'message: ' + msg);
        username = users[findIndex(socket.client.id)].username;
        var message = {
            username: users[findIndex(socket.client.id)].username,
            message: msg,
            timestamp: Date.now
        }
        io.emit('chat message', message);
    });

    socket.on('privateMessage', function(msg){
        var username = msg.split(" ")[1].trim();
        var message = msg.split(" ")[2];
        var fromUsername = users[findIndex(socket.client.id)].username;
        console.log(username);
        if(findUsername(username) >= 0){
            var sock = users[findUsername(username)].socketId;
            socket.to(sock).emit('privateMessage', {username:fromUsername, message:message});
        }
        else{
            socket.emit('server message', {username: 'SERVER', message: 'User not found'});
        }
    });

    socket.on('helpMessage', function(msg){
        var message = '<p style="margin-left: 25px;"><b>Commands: </b><br />/pm to send a private message</br>/username to change username</p>'
        socket.emit('helpMessage', message)
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

function findIndex(sock){
  var i = 0;
  for(i=0;i<users.length;i++){
    if(users[i].socketId===sock){
      return i;
    }
  }
  return i;
}
function findUsername(username){
    var i = 0;
  for(i=0;i<users.length;i++){
    if(users[i].username===username){
        console.log('username found');
      return i;
    }
  }
  console.log('username not found');
  return -1;
}
function updateUsername(){
  var i = 0;
  for(i=0;i<arguments.length;i++){
      console.log('update data');
      console.log(arguments[i]);
      console.log(users[findIndex(arguments[i].sock)]);
    users[findIndex(arguments[i].sock)].username=arguments[i].value;
  }
}