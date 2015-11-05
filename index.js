var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var server = app.listen(port);
var http = require('http');
var io = require('socket.io').listen(server);
var socketList = [];
var Game = require("./public/game_objects.js");

app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.use(express.static(__dirname + '/public'));

var game = new Game();
var vassal = true;
var online = [];
var spectate = [];
var typing = [];
var choices = [];
var players = 6;

io.on('connection', function(socket){
	socket.on('new user', function(user, gender){
    socket.username = user;
    socket.gender = gender;
    if (online.length == 0) {
      socket.emit('players');
    } else if (online.indexOf(socket.username) != -1) {
      socket.emit('username');
    } else {
      if (online.length == players) {
        spectate.push({name: socket.username, gender: socket.gender});
        socket.emit('spectate');
        socket.broadcast.emit('chat message', socket.username + ' is spectating.');
      } else {
        socket.broadcast.emit('chat message', socket.username + ' has connected.');
      }
      online.push({name: socket.username, gender: socket.gender});
      io.emit('online update', online, players);

      if(online.length == players) {
/*        var users = [];
        for (var user in online) {
          if (spectate.indexOf(online[user]) == -1) {
            users.push(online[user]);
          }
        }*/
        io.emit('game', game.setPlayers(online));
      }
    }
	});

  socket.on('players', function(numPlayers) {
    players = numPlayers;
    online.push({name: socket.username, gender: socket.gender});
    io.emit('online update', online, players);
  });

  socket.on('add player', function(player) {
    if (spectate.indexOf(player) != -1) {
      if (game.players) {
        players += 1;
      }
      spectate.splice(spectate.indexOf(player), 1);
      socket.broadcast.emit('chat message', player + ' has connected.');
      // 
    } else {
      socket.emit('chat message', 'Add player ' + player + ' failed.');
    }
  });

  socket.on('disconnect', function(){
    if (typeof socket.username !== 'undefined') {
      io.emit('chat message', socket.username + ' has disconnected');
      if (online.indexOf(socket.username) !== -1) {
        online.splice(online.indexOf(socket.username), 1);
        io.emit('online update', online, players);
      }
      if(online.length == 0) {
        game = new Game();
        vassal = true;
        online = [];
        spectate = [];
        typing = [];
        choices = [];
        players = 6;
      }
    }
  });

  // chat handlers
  socket.on('chat message', function(msg){
    socket.broadcast.emit('chat message', socket.username + ': ' + msg);
  });

  socket.on('typing status', function(username) {
    var old_typing = typing.slice();
    if(username != null && typing.indexOf(socket.username) == -1) {
      typing.push(socket.username);
    }

    if (username == null && typing.indexOf(socket.username) > -1) {
      typing.splice(typing.indexOf(socket.username), 1);
    }

    if (typing != old_typing) {
      socket.broadcast.emit('typing status', typing.toString());
    }
  });

  // leveling
  socket.on('level', function(amount) {
    var player = game.players.get(socket.username);
    player.level += amount;
    io.emit('level', player.name, amount);
    io.emit('history', socket.username + ' level up by 1!');
  });

  // changing strength
  socket.on('strength', function(amount) {
    var player = game.players.get(socket.username);
    player.strength += amount;
    io.emit('strength', player.name, amount);
    io.emit('history', socket.username + ' strength up by 1!');
  });

  // changing treasures
  socket.on('change treasures', function(amount) {
    if (game.round && game.round.combat) {
      game.round.combat.treasures += amount;
    }
  });

  // kick phase

  // loot phase

  // look for trouble phase

  // charity phase

  // draw

  // curse

  // discard

  // trade

  // sell

  // share treasures

  // resurrect

  // end combat

  // end turn

  // run away

  // change gender
  socket.on('change gender', function() {
    var player = game.players.get(socket.username);
    if (player.gender == 'male') {
      player.gender = 'female';
    } else {
      player.gender = 'male';
    }
    io.emit('change gender', socket.username);
    io.emit('history', socket.username + ' has changed gender to ' + player.gender + '.');
  });

  // moving cards
  socket.on('move cards', function(deck, cards) {
    var cardObjects = game.findCards(cards);
    var deckName = '';
    switch (deck) {
      case 'field':
        for (var card of cardObjects.values()) {
          card.setCard(game.field);
        }
        deckName = 'Game Field';
        break;
      case 'discard':
        game.discard(cards);
        deckName = 'discard';
        break;
      case 'doors':
        for (var card of cardObjects.values()) {
          card.setCard(game.doors);
        }
        deckName = 'Doors';
      case 'treasures':
        for (var card of cardObjects.values()) {
          card.setCard(game.treas);
        }
        deckName = 'Treasures';
        break;
      default:
        var deckWords = deck.split(' ');
        var player = game.players.get(deckWords[0]);
        switch (deckWords[1]) {
          case 'field':
            for (var card of cardObjects.values()) {
              card.setCard(player.field);
            }
            deckName = player.name + ' Field';
            break;
          case 'hand':
            for (var card of cardObjects.values()) {
              card.setCard(player.hand);
            }
            deckName = player.name + ' Hand';
            break;
          case 'classes':
            for (var card of cardObjects.values()) {
              card.setCard(player.classes);
            }
            deckName = player.name + ' Classes';
            break;
          case 'races':
            for (var card of cardObjects.values()) {
              card.setCard(player.races);
            }
            deckName = player.name + ' Races';
            break;
          case 'bonuses':
            for (var card of cardObjects.values()) {
              card.setCard(player.bonuses);
            }
            deckName = player.name + ' Bonuses';
            break;
          default:
            console.log('No deck found');
            break;
        }
        break;
    }
    var cardString = '';
    for (var card of cards) {
      cardString = cardString.concat(card + ', ');
    }
    cardString = cardString.substring(0, cardString.length - 2);
    if (deckName == 'discard') {
      if ('treasure item bonus'.indexOf(cardObjects.values().next().value.cardType) !== -1) {
        deckName = 'Treasures Discard';
      } else {
        deckName = 'Doors Discard';
      }
    }
    cardString = cardString.concat(' added to ' + deckName + '.');
    io.emit('history', cardString);
    io.emit('move cards', deck, cards);
  });

  socket.on('toggle equip', function(cardName) {
    var card = game.findCards([cardName]);
    var equipString = ' equipped ';
    if (card.isEquipped) {
      card.isEquipped = false;
      equipString = ' unequipped ';
      io.emit('toggle equip', cardName);
    } else {
      card.isEquipped = true;
      io.emit('toggle equip', cardName);
    }
    io.emit('history', socket.username + equipString + cardName + '.');
  });

  socket.on('draw', function(deck) {
    var player = game.players.get(socket.username);
    var deckName = '';
    switch (deck) {
      case 'doors':
        player.draw(game.doors, game.dDis, 1);
        deckName = 'Doors';
        break;
      case 'treas':
        player.draw(game.treas, game.tDis, 1);
        deckName = 'Treasures';
        break;
      case 'dDis':
        player.draw(game.tDis, new Deck(), 1);
        deckName = 'Doors Discard';
        break;
      case 'tDis':
        player.draw(game.tDis, new Deck(), 1);
        deckName = 'Treasures Discard';
        break;
      default:
        break;
    }
    io.emit('draw', socket.username, deck);
    io.emit('history', socket.username + ' drew from ' + deckName + '.');
  });

  socket.on('kick', function() {
    var player = game.players.get(socket.username);
    game.kick();
    io.emit('kick');
    io.emit('history', socket.username + ' has kicked!');
  });

  socket.on('random val', function(val) {
    io.emit('random val', val);
    io.emit('history', socket.username + ' has rolled for ' + val.toString() + '.');
  });
/*
  //trade
  socket.on('trade', function(player, cards1, cards2) {
    game.trade(socket.username, player, cards1, cards2);
  });

  // vote handlers
  socket.on('vote prompt', function(topic, minYesVote, message) {
    voteTopic = topic;
    io.emit('vote prompt', minYesVote, message);
  });

  socket.on('vote', function(minYesVote, choice) {
    if (choices.length == players) {
        var yesChoices = choices.filter(function(choice) {
          return choice == 'yes'; // make sure it makes sense
        });
        if (yesChoices.length >= minYesVote) {
          io.emit(voteTopic);
          choices = [];
        }
        else {
          choices.push(choice);
        }
      }
  });

  // vassal mode handlers
  socket.on('vassal prompt', function(username) {
    socket.broadcast.emit('vassal prompt', username);
  });

  socket.on('dvassal prompt', function(username) {
    socket.broadcast.emit('vassal prompt', username);
  });

  socket.on('vassal', function(choice) {
    if (choices.length == players) {
      var yesChoices = filter(function(choice) {
        return choice == 'yes';
      });
      if (yesChoices.length == players) {
        io.emit('dvassal');
      }
      else {
      choices.push(choice);
      }
    }
  });

/*  socket.on('dvassal', function(choice) {
    if (choices.length == players) {
      var yesChoices = filter(function(choice) {
        return choice == 'yes';
      });
      if (yesChoices.length >= truemath.floor(players/2)) {
        io.emit('dvassal');
        choices = [];
      } else {
      choices.push(choice);
      }
    }
  });*/
});