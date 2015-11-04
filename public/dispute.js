function winCombat() {
	socket.emit('end player combat');
}

socket.on('dispute', function(player) {
	$('#dispute').show();
	setTimeout(function() {
		if ($('#dispute').is(':visible')) {
			if (username == player) {
				socket.emit('end combat');
			}
			$('#dispute').hide();
		}}, 2000);
});

socket.on('disputed', function() {
	$('#dispute').hide();
	if (username == game.round.player) {
		$('#endCombat').hide();
		setTimeout(function() {
			$('#endCombat').show();
		}, 10000)
	}
});

//serverside
socket.on('end player combat', function() {
	socket.broadcast.emit('dispute');
	socket.emit('chat message', 'You have disputed combat.');
	socket.broadcast.emit('chat message', socket.username + ' has disputed'
		+ ' combat.');
});

socket.on('dispute', function(username) {
	socket
})