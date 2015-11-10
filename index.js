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
var oldRoll = 1;

io.on('connection', function(socket){
  if (online.length == 0) {
    socket.emit('players');
  }

	socket.on('new user', function(user, gender){
    socket.username = user;
    socket.gender = gender;
    if (socketList.indexOf(socket.username) !== -1) {
      socket.emit('username');
    } else {
      if (online.length >= players) {
        spectate.push({name: socket.username, gender: socket.gender});
        socket.emit('spectate');
        socket.broadcast.emit('chat message', socket.username + ' is spectating.');
      } else {
        socket.broadcast.emit('chat message', socket.username + ' has connected.');
      }
      socketList.push(user);
      online.push({name: socket.username, gender: socket.gender});
      io.emit('online update', online, players);

      if(online.length == players && spectate.length == 0) {
/*        var users = [];
        for (var user in online) {
          if (spectate.indexOf(online[user]) == -1) {
            users.push(online[user]);
          }
        }*/
        if (game.players.size === 0) {
          game.initPlayers(online);
          io.emit('game', game.getGameInfo(), true);          
        } /*else {
          socket.emit('game', game.getGameInfo(), true);
          socket.broadcast.emit('game', [], false);
        }*/
        // add support for connecting after disconnect
      }
    }
	});

  socket.on('players', function(numPlayers) {
    players = numPlayers;
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

  socket.on('spectate', function() {
    socket.emit('game', game.getGameInfo(), true);
  });

  socket.on('disconnect', function(){
    if (typeof socket.username !== 'undefined') {
      io.emit('chat message', socket.username + ' has disconnected');

      online.splice(socketList.indexOf(socket.username), 1);
      socketList.splice(socketList.indexOf(socket.username), 1);
      io.emit('online update', online, players);

      if (game.players.size > 0) {
        if (spectate.indexOf(socket.username) !== -1) {
          spectate.splice(socketList.indexOf(socket.username), 1);
        } else {
          if (spectate.length > 0) {
            var replacement = spectate.shift();
            var replaceSocket = socketList.indexOf(replacement.name);
            socketList[replaceSocket] = replacement.name;
            online[replaceSocket] = replacement;

            io.emit('unspectate', socket.username, replacement.name);
          } else {
            io.emit('online update', online, players);
          }
        }
      }

      if(online.length == 0) {
        vassal = true;
        online = [];
        spectate = [];
        typing = [];
        choices = [];
        players = 6;
        while (game.players.size > 0) {
          var playerName = game.players.keys().next().value;
          game.delPlayer(playerName);
        }
      }
    }
  });

  socket.on('unspectate', function(name, gender) {
    socket.username = name;
    socket.gender = gender;
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
    var levelString = '';
    player.level += amount;
    io.emit('level', player.name, amount);
    if (amount < 0) {
      levelString = ' level down by 1!';
    } else {
      levelString = ' level up by 1!';
    }
    io.emit('history', socket.username + levelString);
  });

  // changing strength
  socket.on('strength', function(amount) {
    var player = game.players.get(socket.username);
    var strengthString = '';
    player.strength += amount;
    io.emit('strength', player.name, amount);
    if (amount < 0) {
      strengthString = ' strength down by 1!';
    } else {
      strengthString = ' strength up by 1!';
    }
    io.emit('history', socket.username + strengthString);
  });

  // changing treasures
  socket.on('change treasures', function(amount) {
    if (game.round && game.round.combat) {
      game.round.combat.treasures += amount;
    }
  });

  // kick phase
  socket.on('kick', function() {
    var player = game.players.get(socket.username);
    game.kick();
    io.emit('kick');
    io.emit('history', socket.username + ' has kicked!');
  });

  socket.on('toggle hand', function() {
    io.emit('toggle hand', socket.username);
    io.emit('history', socket.username + ' has toggled their hand.');
  });

  socket.on('toggle deck', function(deckName) {
    var nameString = '';
    switch (deckName) {
      case 'door':
        nameString = 'Doors';
        break;
      case 'treas':
        nameString = 'Treasures';
        break;
      case 'dDis':
        nameString = 'Doors Discard';
        break;
      case 'tDis':
        nameString = 'Treasures Discard';
        break;
      default:
        break;
    }
    socket.emit('toggle deck', deckName);
    io.emit('history', socket.username + ' has toggled ' + nameString);
  });

  socket.on('shuffle', function(deckName) {
    switch (deckName) {
      case 'doors':
        game.doors.dShuffle();
        break;
      case 'treas':
        game.treas.dShuffle();
        break;
      case 'tDis':
        game.tDis.dShuffle();
        break;
      case 'dDis':
        game.dDis.dShuffle();
        break;
      default:
        break;
    }
    var deckInfo = game.getGameInfo();
    // finish
  })

  socket.on('face up', function(deckName) {
    var player = game.players.get(socket.username);
    if (deckName == 'doors') {
      var card = game.doors.selectCard('last');
      player.draw(game.doors, game.dDis, 1);
      game.findCards([card.name]).values().next().value.setCard1(game.field);
    } else {
      var card = game.treas.selectCard('last');
      player.draw(game.treas, game.tDis, 1);
      game.findCards([card.name]).values().next().value.setCard1(game.field);
    }
    io.emit('face up', socket.username, deckName);
    io.emit('history', socket.username + ' has drawn ' + card.name + ' face up.');
  })

  // loot phase
  socket.on('loot', function() {
    var player = game.players.get(socket.username);
    player.draw(game.doors, game.dDis, 1);
    io.emit('loot', socket.username);
    io.emit('history', socket.username + ' has looted the room!');
  });

  // look for trouble phase
  socket.on('look', function(monsterName) {
    var monster = game.findCards([monsterName]).values().next().value;
    monster.setCard1(game.field);

    io.emit('look', monsterName);
    io.emit('history', socket.username + ' is looking for trouble!');
  });

  socket.on('monster strength', function(amount) {
    var strengthString = 'Monster strength up by 1.';
    io.emit('monster strength', amount);
    if (amount < 0) {
      strengthString = 'Monster strength down by 1.';
    }
    io.emit('history', strengthString);
  });

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
  socket.on('end turn', function(playerName) {
    game.turn += 1;
    game.turn %= game.players.size;
    var name = game.players.keys();
    for (var i = 0; i < game.turn; i++) {
      name.next();
    }
    io.emit('end turn', name.next().value);
    io.emit('history', socket.username + ' has ended their turn.')
  });

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
          card.setCard1(game.field);
        }
        deckName = 'Game Field';
        break;
      case 'discard':
        game.discard(cards);
        deckName = 'discard';
        break;
      case 'doors':
        for (var card of cardObjects.values()) {
          card.setCard1(game.doors);
        }
        deckName = 'Doors';
      case 'treasures':
        for (var card of cardObjects.values()) {
          card.setCard1(game.treas);
        }
        deckName = 'Treasures';
        break;
      default:
        var deckWords = deck.split(' ');
        var player = game.players.get(deckWords[0]);
        switch (deckWords[1]) {
          case 'field':
            for (var card of cardObjects.values()) {
              card.setCard1(player.field);
            }
            deckName = player.name + ' Field';
            break;
          case 'hand':
            for (var card of cardObjects.values()) {
              card.setCard1(player.hand);
            }
            deckName = player.name + ' Hand';
            break;
          case 'classes':
            for (var card of cardObjects.values()) {
              card.setCard1(player.classes);
            }
            deckName = player.name + ' Classes';
            break;
          case 'races':
            for (var card of cardObjects.values()) {
              card.setCard1(player.races);
            }
            deckName = player.name + ' Races';
            break;
          case 'bonuses':
            for (var card of cardObjects.values()) {
              card.setCard1(player.bonuses);
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
      card = card.replace('_', ' ');
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
    var card = game.findCards([cardName]).values().next().value;
    var equipString = ' equipped ';
    if (card.isEquipped) {
      card.isEquipped = false;
      equipString = ' unequipped ';
    } else {
      card.isEquipped = true;
    }
    io.emit('toggle equip', cardName, card.isEquipped);
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

  //dialogs
  socket.on('show dialog', function(dialogName, hideFields) {
    io.emit('show dialog', socket.username, dialogName, hideFields);
  });

  socket.on('hide dialog', function(dialogName, showFields) {
    io.emit('hide dialog', dialogName, showFields);
  });

  //diceRoll
  socket.on('roll dice', function(endVal) {
    io.emit('roll dice', oldRoll, endVal);
    setTimeout(function() {
      io.emit('history', socket.username + ' has rolled for a ' + endVal + '!');
    }, 8000);
    oldRoll = endVal;
  });

  //notices
  socket.on('notice', function(topic, target) {
    var message = '';
    switch(topic) {
      case 'Kick':
        message = socket.username + ' has kicked!';
        break;
      case 'Loot':
        topic = 'Loot the Room';
        message = socket.username + ' is looting the room!';
        break;
      case 'Look':
        topic = 'Look for Trouble';
        message = socket.username + ' is looking for trouble!';
        break;
      case 'Curse':
        message = socket.username + ' has cursed ' + target + '!';
        break;
      case 'End Turn':
        message = socket.username + ' has ended their turn.';
        break;
      case 'Gender':
        message = socket.username + ' has switched genders!';
        break;
      case 'Replacement':
        message = socket.username + ' has replaced ' + target + '!';
        break;
      default:
        break;
    }
    socket.broadcast.emit('notice', socket.username, topic, message);
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