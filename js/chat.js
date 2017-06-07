$(document).ready(function(){
    
    $('#messages').append($('<li>').text('Set your username with /username'));

    var socket = io();
    $('form').submit(function () {
        var message = $('#m').val();
        if(message.startsWith('/username')){
            console.log('Setting username');
            socket.emit('addUsername', message);
        }
        else{
            socket.emit('chat message', message);
        }
        $('#m').val('');
        return false;
    });
    
    socket.on('chat message', function(msg){
        var message = msg.username + ': ' + msg.message;
        $('#messages').append($('<li>').text(message));
    });
});