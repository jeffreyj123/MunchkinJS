function getSelected() {
  return selectedCards;
}

function randomVal() {
  var randomVal = Math.random() * 6;
  randomVal = Math.floor(randomVal) + 1;
  socket.emit('random val', randomVal);
}

socket.on('random val', function(val) {
  $('#randomVal').text(val);
});

socket.on('move cards', function(deck, cards) {
  var cardObjects = game.findCards(cards);
  var playerName = '';
  var fieldName = '';
  switch (deck) {
    case 'field':
      for (var card of cardObjects.values()) {
        card.setCard1(game.field);
      }
      playerName = 'game';
      fieldName = 'Field';
      break;
    case 'discard':
      game.discard(cards);
      playerName = 'discard';
      fieldName = 'Field';
      break;
    case 'doors':
      for (var card of cardObjects.values()) {
        card.setCard1(game.doors);
      }
      playerName = 'doors';
      fieldName = 'Field';
      break;
    case 'treasures':
      for (var card of cardObjects.values()) {
        card.setCard1(game.treas);
      }
      playerName = 'treasures';
      fieldName = 'Field';
      break;
    default:
      var deckWords = deck.split(' ');
      playerName = deckWords[0];
      fieldName = 'Field';
      var player = game.players.get(playerName);
      switch (deckWords[1]) {
      case 'field':
        for (var card of cardObjects.values()) {
          card.setCard1(player.field);
        }
        break;
      case 'hand':
        for (var card of cardObjects.values()) {
          card.setCard1(player.hand);
        }
        fieldName = 'Hand';
        break;
      case 'classes':
        for (var card of cardObjects.values()) {
          card.setCard1(player.classes);
        }
        break;
      case 'races':
        for (var card of cardObjects.values()) {
          card.setCard1(player.races);
        }
        break;
      case 'bonuses':
        for (var card of cardObjects.values()) {
          card.setCard1(player.bonuses);
        }
        break;
      default:
        console.log('No deck found');
        return;
    }
    break;
  }
  if (playerName == username) {
    loadCards('card', fieldName, cards);
  } else {
    if (playerName == 'discard') {
      if ('treasure item bonus'.indexOf(game.findCards(cards).values().next().value.cardType) !== -1) {
        playerName = 'tDis';
      } else {
        playerName = 'dDis';
      }
    }
    loadCards(playerName, fieldName, cards);
  }
});

function updateTurnPlayer() {
  if (game.round !== null) {
    $('#turnPlayerInfo').show();
    $('#turnPlayer').text(game.round.playerName);
  } else {
    $('#turnPlayerInfo').hide();
  }
}

function level(amount) {
  socket.emit('level', amount);
  var level = parseInt($('#level').text(), 10);
  var newLevel = (level + amount).toString();
  $('#level').text(newLevel);
}

function strength(amount) {
  socket.emit('strength', amount);
  var strength = parseInt($('#strength').text(), 10);
  var newStrength = (strength + amount).toString();
  $('#strength').text(newStrength);
}

socket.on('level', function(player, amount) {
  if (username !== player) {
    player = game.players.get(player);
    player.level += amount;
    $('.' + player.name + 'Level').text(player.level.toString());
  }
  if (game.round !== null && game.round.combat !== null) {
    game.round.combat.strength();
  }
  updateTurnPlayer();
});

socket.on('strength', function(player, amount) {
  if (username !== player) {
    player = game.players.get(player);
    player.strength += amount;
    $('.' + player.name + 'Strength').text(player.strength.toString());
  }
  if (game.round !== null && game.round.combat !== null) {
    game.round.combat.strength();
  }
  updateTurnPlayer();
});

function monsterStr(amount) {
  socket.emit('monster strength', amount);
}

socket.on('monster strength', function(amount) {
  var strength = parseInt($('#monster').text(), 10);
  var newStrength = (strength + amount).toString();
  $('#monsterStr').text(newStrength);
/*  game.round.combat.monsterStr += amount;*/
});

//untested
socket.on('change gender', function(name) {
  var selector = '';
  if (name !== username) {
    selector = '.' + name + 'Gender';
  } else {
    selector = '#gender';
  }
  var player = game.players.get(name)
  if (player.gender == 'male') {
    player.gender = 'female';
    $(selector).text('female');
  } else {
    player.gender = 'male';
    $(selector).text('male');
  }
});

socket.on('draw', function(player, deck) {
  var card;
  var player = game.players.get(player);
  switch (deck) {
    case 'doors':
      card = game.doors.selectCard("last");
      player.draw(game.doors, game.dDis, 1);
      break;
    case 'treas':
      card = game.treas.selectCard("last");
      player.draw(game.treas, game.tDis, 1);
      break;
    default:
      break;
  }
  if (player.name == username) {
    loadCards('card', 'Hand', [card.name]);
  } else {
    loadCards(player.name, 'Hand', [card.name]);
  }
});

socket.on('kick', function() {
  game.kick();
  var card = game.field.selectCard('last').name;
  loadCards('game', 'Field', [card]);
});

socket.on('toggle hand', function(playerName) {
  if (playerName !== username) {
    $('#' + playerName + 'HandCards').toggle();
  }
});

socket.on('toggle deck', function(deckName) {
  $('#' + deckName + 'CardDiv').toggle();
});

socket.on('face up', function(playerName, deckName) {
  var player = game.players.get(playerName);
  if (deckName == 'doors') {
    var card = game.doors.selectCard('last');
    player.draw(game.doors, game.dDis, 1);
    game.findCards([card.name]).values().next().value.setCard1(game.field);
  } else {
    var card = game.treas.selectCard('last');
    player.draw(game.treas, game.tDis, 1);
    game.findCards([card.name]).values().next().value.setCard1(game.field);
  }
  loadCards('game', 'Field', [card.name]);
});

socket.on('look', function(monsterName) {
  var monster = game.findCards([monsterName]).values().next().value;
  monster.setCard1(game.field);
  loadCards('game', 'Field', [monsterName]);
});

socket.on('loot', function(playerName) {
  game.players.get(playerName).draw(game.doors, game.dDis, 1);
  var card = game.doors.selectCard('last');
  if (playerName == username) {
    playerName = 'card';
  }
  loadCards(playerName, 'Hand', [card.name]);
});

socket.on('end turn', function(playerName) {
  $('#turnPlayer').text(playerName);
  game.turn += 1;
  game.turn %= game.players.size;
});

// make curse specific
// make round updater

/*function charityDialog() {
  $('#fields').hide();
  $('#charity').show();
}

function confirmCharity() {
  var lowest = game.lowestLevel();
  // finish charity
  $('#charity').hide();
  $('#fields').show();
}

function cancelCharity() {
  $('#charity').hide();
  $('#fields').show();
}

function loot() {
  socket.emit('loot');
}

function trouble() {
  var cards = getSelected();
  if (cards.length == 0 || cards.length > 1) {
    prompt('Can only look for one monster!');
  }
  socket.emit('trouble', cards);
}

function runAway() {
  var randomVal = Math.random() * 6;
  randomVal = Math.floor(randomVal) + 1;
  socket.emit('run away', randomVal);
}

socket.on('run away', function(runVal) {
  diceDialog(runVal);
  if (roll < runVal) {
    runDialog(false);
  } else {
    runDialog(true);
  }
})

function runDialog(runBool) {
  $('#fields').hide();
  if (runBool) {
    $('#runDialogSuccess').show();
    // wait a bit
    $('#runDialogSuccess').hide();
  } else {
    $('#runDialogFail').show();
    // wait a bit
    $('#runDialogFail').hide();
  }
  $('#fields').show();
}

function diceDialog(endVal) {
  // roll GUI
  $('#fields').hide();
  $('#diceDialog').show();
  for (var i = 0; i < 31 + endVal; i++) {
    $('#dice').attr('src', "/dice" + i.toString());
    // wait a bit
  }
  $('#diceDialog').hide();
  $('#fields').show();
}

function ask(topic, player, message, args) {
  args = typeof args !== 'undefined' ? args : null;
  socket.emit('ask', topic, player, message, args);
}

socket.on('ask prompt', function(message, args) {
  if (spectate) {
    return;
  }
  var choice = prompt(message);
  socket.emit('prompt', choice, args);
})

function vote(topic, minYesVote, message, args) {
  args = typeof args !== 'undefined' ? args : null;
  socket.emit('vote', topic, minYesVote, message, args);
}

socket.on('vote prompt', function(minYesVote, message, args) {
  if (spectate) {
    return;
  }
  var choice = prompt(message);
  socket.emit('vote', minYesVote, choice, args);
});

function curseDialog(curser, cursed, cardName) {
  $('#fields').hide();
  $('#cursePlayer').text(curser);
  $('#cursedPlayer').text(cursed);
  $('#curseCard').text(cardName);
  $('#curse').show()
  //wait a bit
  $('#curse').hide();
  $('#fields').show();
}

socket.on('curse', function(curser, cursed, cardName) {
  curseDialog(curser, cursed, cardName);
});*/

    /*<!--  <script> // not so relevant
      function enableVassal() {
        var confirm = prompt('Enable vassal?');
        if (confirm) {
          socket.emit('vote prompt', 'vassal', gamestate.players.length, username + ' has requested to enable vassal mode. Switch?');
        }
      }

      function disableVassal() {
        var confirm  = prompt('Disable vassal?');
        if (confirm) {
          socket.emit('vote prompt', 'vassal', gamestate.players.length, username + ' has requested to disable vassal mode. Switch?');
        }
      }

      socket.on('vassal', function() {
        $('#enableVassal').toggle();
        $('#disableVassal').toggle();
      });
    </script>
    <script> // trade scheme
      function tradeDialog(player1, player2) {
        if (username != player1) {
          $('#tradeConfirm').hide();
          $('#tradeCancel').hide();
        } else {
          var player1 = gamestate.players.filter(function(player) {
              return player.name == username;
            });
          var player2 = gamestate.players.filter(function(player) {
              return player.name == player2;
            });
          var cards1 = player1.equipment.cards.keys();
          var cards2 = player2.equipment.cards.keys();
          var cards = cards1.concat(cards2);
          for (var card of cards) {
            $('#' + card).mousedown(function(e) {
              if (e.which == 3) {
                $('#tradePlayer1').append('<img class="card" id="' + card + 'Trade" src="' + name + '.gif" />')
                $('#' + card + 'Trade').click(function() {
                  $('#' + card + 'Trade').remove();
                });
              }
            });
          }
          $('#tradeConfirm').show();
          $('#tradeCancel').show();
        }

        $('#tradePlayer1').attr('value', player1);
        $('#tradePlayer2').attr('value', player2);
        $('#hideFields').show();
        $('#tradeDialog').show();
      }

      function confirmTrade() {
        ask('trade', $('#tradePlayer2Name').value(), "Accept trade with " + username + "?");
      }

      function closeTrade() {
        if (username == player1) {
          var player1 = gamestate.players.filter(function(player) {
              return player.name == username;
            });
          var player2 = gamestate.players.filter(function(player) {
              return player.name == player2;
            });
          var cards1 = player1.equipment.cards.keys();
          var cards2 = player2.equipment.cards.keys();
          var cards = cards1.concat(cards2);
          for (var card of cards) {
            $('#' + card).off('mousedown');
          }
        }

        $('#tradeDialog').hide();
        $('#hideFields').hide();
        $('#tradePlayer1Cards').empty();
        $('#tradePlayer1Cards').empty();
      }

      socket.on('trade', function(player1, player2) {
        tradeDialog(player1, player2);
      });

      socket.on('confirm trade', function(player1, player2, cards1, cards2) {
        var cards1String = "", cards2String = "";
        for (var card of cards1) {
          cards1String = cards1String.concat(card + ", ");
        }
        for (var card of cards2) {
          cards2String = cards2String.concat(card + ", ");
        }

        if (cards1String == "") {
          cards1String = "nothing";
        } else {
          cards1String.slice(0, cards1String.length - 2);
        }
        if (cards2String == "") {
          cards2String = "nothing";
        } else {
          cards2String.slice(0, cards2String.length - 2);
        }

        closeTrade();
        history(player1 + " traded " + cards1String + " with " + player2 + " for " + cards2String);
      });
    </script>
    <script> // kick confirm
      //  kick vote, add vote
      function kickPlayer(playerName) {
        // switch prompt method if so desired, for example a player menu on the button
        vote('kick player', numPlayers, "Kick " + playerName + "?", [playerName]);
      }
    </script>
    <script> // treasure sharing
      var shareCards = new Map();
      function shareDialog(player1, player2) {
        if (username != player1) {
          $('#shareConfirm').hide();
          $('#shareCancel').hide();
          $('#addShare1').hide();
          $('#addShare2').hide();
        } else {
          $('#shareConfirm').show();
          $('#shareCancel').show();
          $('#addShare1').show();
          $('#addShare2').show();
        }

        shareCards = new Map();
        $('#sharePlayer1').attr('value', player1);
        $('#sharePlayer2').attr('value', player2);
        $('#shareDialog').show();
      }

      function confirmShare() {
        ask('share', $('#sharePlayer2Name').value(), "Accept " + username + "'s treasure configuration?");
      }

      function closeShare() {
        $('#shareDialog').hide();
        $('#hideFields').hide();
        $('#sharePlayer1').empty();
        $('#sharePlayer2').empty();
      }

      function addShareCard(field) { // finish dealing with mapping for dealing out treasures
        var num = shareCards.size;
        shareCards.set(num + 1, $('#cardShare' + num));
        num += 1;
        $(field).append('<img class="card random" id="cardShare"' + num + ' src="random.gif" />');
        $('#cardShare' + num).click(function() {
          shareCards.remove(num);
          $('#cardShare' + num).remove();
        }).mousedown(function(e) {
          if (e.which == 3) {
            $('#cardShare' + num).toggleClass("random choice");
            if (('#cardShare' + num).hasClass("random")) {
              $('#cardShare' + num).attr("src", "choice.gif")
            } else {
              $('#cardShare' + num).attr("src", "random.gif")
            }
          }
        });
      }

      function shareTreasures() {

      }

      socket.on('treasure sharing', function(user1, user2) {
        shareDialog(user1, user2);
      });

      socket.on('share confirm', function() {
        shareTreasures();
        closeShare();
      });

    </script>
    <script> // dispute
      function endTurnDialog() {
        $('#hideFields').show();
        $('#endCombatDialog').show();
        // start timer func perhaps within show
      }

      function endCombat() {
        socket.emit('end combat');
      }

      socket.on('dispute', function() {
        $('#hideFields').hide();
        $('#endCombatDialog').hide();
      });
    </script>
    <script> // sell
      function sell() {
        socket.emit('sell', getSelected());
      }

      function sellDialog() {
        $('#sellDialog').show();
        setInterval(function() {
          var cards = getSelected();
          var value = 0;
          for (var card in cards) {
            if(cards[card].cardType != 'item') {
              $('#sell').addClass('opaque');
            } else {
              value += cards[card].cardInfo["value"];
            }
          }
          $('#sellValue').attr('value', value);
        }, 500);

      }
    </script>
    <script> // discard check for turns/other basic rules</script>
    <script> // charity</script>
    <script> // loot the room</script>
    <script> // run away</script>
    <script> // curse</script>
    <script> // vote scheme</script> -->*/