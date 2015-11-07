function myMessage(message) {
  $('#messages').append($('<li>').text(message));
  $('#messages').animate({
  scrollTop: $('#messages').get(0).scrollHeight}, 2000);
  chatAudio.play();
}

function history(message) {
  $('#history').append($('<li>').text(message));
  $('#history').animate({
  scrollTop: $('#history').get(0).scrollHeight}, 2000);
}

$('#chatForm').submit(function(){
  myMessage('Me: ' + $('#m').val());
  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  return false;
});

socket.on('chat message', function(msg){
  myMessage(msg);
});

socket.on('history', function(msg) {
  history(msg);
})

socket.on('typing status', function(typing){
  typing = typing.replace(',', ', ');
  typing = typing.replace($('#user').val(), '');
  typing = typing.replace($('#user').val(), '');
  if (typing != '') {
    if (typing.indexOf(',') > -1) {
      typing += " are typing.";
    } else {
      typing += " is typing.";
    }
  }
  $('#typing').text(typing);
});

var textarea = $('#m');
var lastTypedTime = new Date(0);
var typingDelayMillis = 5000;

function refreshTypingStatus() {
    if (!textarea.is(':focus') || textarea.val() == '' || new Date().getTime() - lastTypedTime.getTime() > typingDelayMillis) {
        socket.emit('typing status', null);
    } else {
        socket.emit('typing status', $('#user').val());
    }
}

function updateLastTypedTime() {
    lastTypedTime = new Date();
}

setInterval(refreshTypingStatus, 1000);
textarea.keypress(updateLastTypedTime);
textarea.blur(refreshTypingStatus);