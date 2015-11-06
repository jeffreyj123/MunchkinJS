"use strict";
var method = Game.prototype;

function Game() {
  this.players = new Map();
  this.unsetPlayers = new Map();
  this.vassal = true;
  this.turn = 0;
  this.round = null;
  this.trade = null;

  for (var i = 0; i < 6; i++) {
    this.unsetPlayers.set("player" + i.toString(),
      new Player("player" + i.toString()));
  }

  var treasures = [["1000_gold_pieces", new Card(['1000_gold_pieces', 'treasure'])], ["boots_of_butt-kicking", new Card(['boots_of_butt-kicking', 'item'])], ["boots_of_running_really_fast", new Card(['boots_of_running_really_fast', 'item'])], ["bribe_gm_with_food", new Card(['bribe_gm_with_food', 'treasure'])], ["broad_sword", new Card(['broad_sword', 'item'])], ["buckler_of_swashing", new Card(['buckler_of_swashing', 'item'])], ["chainsaw_of_bloody_dismemberment", new Card(['chainsaw_of_bloody_dismemberment', 'item'])], ["cheese_grater_of_piece", new Card(['cheese_grater_of_piece', 'item'])], ["cloak_of_obscurity", new Card(['cloak_of_obscurity', 'item'])], ["convenient_addition_error", new Card(['convenient_addition_error', 'treasure'])], ["cotion_of_ponfusion", new Card(['cotion_of_ponfusion', 'bonus'])], ["dagger_of_treachery", new Card(['dagger_of_treachery', 'item'])], ["doppleganger", new Card(['doppleganger', 'treasure'])], ["electric_radioactive_poison", new Card(['electric_radioactive_poison', 'bonus'])], ["eleven-foot_pole", new Card(['eleven-foot_pole', 'item'])], ["flaming_armor", new Card(['flaming_armor', 'item'])], ["flaming_poison_potion", new Card(['flaming_poison_potion', 'bonus'])], ["flask_of_glue", new Card(['flask_of_glue', 'treasure'])], ["freezing_explosive_potion", new Card(['freezing_explosive_potion', 'bonus'])], ["gentlemens_club", new Card(["gentlemens_club", 'item'])], ["hammer_of_kneecapping", new Card(['hammer_of_kneecapping', 'item'])], ["helm_of_courage", new Card(['helm_of_courage', 'item'])], ["hireling", new Card(['hireling', 'item'])], ["hoard", new Card(['hoard', 'treasure'])], ["horny_helmet", new Card(['horny_helmet', 'item'])], ["instant_wall", new Card(['instant_wall', 'item'])], ["invisibility_potion", new Card(['invisibility_potion', 'item'])], ["invoke_obscure_rules", new Card(['invoke_obscure_rules', 'treasure'])], ["kill_the_hireling", new Card(['kill_the_hireling', 'treasure'])], ["leather_armor", new Card(['leather_armor', 'item'])], ["limburger_and_anchovy_sandwich", new Card(['limburger_and_anchovy_sandwich', 'item'])], ["loaded_die", new Card(['loaded_die', 'item'])], ["mace_of_sharpness", new Card(['mace_of_sharpness', 'item'])], ["magic_lamp", new Card(['magic_lamp', 'item'])], ["magic_missile", new Card(['magic_missile', 'bonus'])], ["mithril_armor", new Card(['mithril_armor', 'item'])], ["mutilate_the_bodies", new Card(['mutilate_the_bodies', 'treasure'])], ["nasty-tasting_sports_drink", new Card(['nasty-tasting_sports_drink', 'bonus'])], ["pantyhose_of_giant_strength", new Card(['pantyhose_of_giant_strength', 'item'])], ["pointy_hat_of_power", new Card(['pointy_hat_of_power', 'item'])], ["polymorph_portion", new Card(['polymorph_portion', 'item'])], ["potion_of_halitosis", new Card(['potion_of_halitosis', 'bonus'])], ["potion_of_idiotic_bravery", new Card(['potion_of_idiotic_bravery', 'bonus'])], ["pretty_balloons", new Card(['pretty_balloons', 'bonus'])], ["rapier_of_unfairness", new Card(['rapier_of_unfairness', 'item'])], ["rat_on_a_stick", new Card(['rat_on_a_stick', 'item'])], ["really_impressive_title", new Card(['really_impressive_title', 'treasure'])], ["sandals_of_protection", new Card(['sandals_of_protection', 'item'])], ["shield_of_ubiquity", new Card(['shield_of_ubiquity', 'item'])], ["singing_and_dancing_sword", new Card(['singing_and_dancing_sword', 'item'])], ["sleep_potion", new Card(['sleep_potion', 'bonus'])], ["slimy_armor", new Card(['slimy_armor', 'item'])], ["sneaky_bastard_sword", new Card(['sneaky_bastard_sword', 'item'])], ["spiky_knees", new Card(['spiky_knees', 'item'])], ["staff_of_napalm", new Card(['staff_of_napalm', 'item'])], ["steal_a_level", new Card(['steal_a_level', 'treasure'])], ["swiss_army_polearm", new Card(['swiss_army_polearm', 'item'])], ["wand_of_dowsing", new Card(['wand_of_dowsing', 'item'])], ["whine_at_the_gm", new Card(['whine_at_the_gm', 'treasure'])], ["wishing_ring", new Card(['wishing_ring', 'item'])], ["yuppie_water", new Card(['yuppie_water', 'bonus'])]];

  var doors = [["3872_orcs", new Card(['3872_orcs', 'monster'])], ["amazon", new Card(['amazon', 'monster'])], ["ancient_+10_to_monster", new Card(['ancient_+10_to_monster', 'door'])], ["baby_-5_to_monster", new Card(['baby_-5_to_monster', 'door'])], ["bigfoot", new Card(['bigfoot', 'monster'])], ["bullfrog", new Card(['bullfrog', 'monster'])], ["change_class", new Card(['change_class', 'curse'])], ["change_race", new Card(['change_race', 'curse'])], ["change_sex", new Card(['change_sex', 'curse'])], ["cheat", new Card(['cheat', 'door'])], ["chicken_on_your_head", new Card(['chicken_on_your_head', 'curse'])], ["cleric", new Card(['cleric', 'class'])], ["crabs", new Card(['crabs', 'monster'])], ["divine_intervention", new Card(['divine_intervention', 'door'])], ["drooling_slime", new Card(['drooling_slime', 'monster'])], ["duck_of_doom", new Card(['duck_of_doom', 'curse'])], ["dwarf", new Card(['dwarf', 'race'])], ["elf", new Card(['elf', 'race'])], ["enraged_+5_to_monster", new Card(['enraged_+5_to_monster', 'door'])], ["face_sucker", new Card(['face_sucker', 'monster'])], ["floating_nose", new Card(['floating_nose', 'monster'])], ["flying_frogs", new Card(['flying_frogs', 'monster'])], ["gazebo", new Card(['gazebo', 'monster'])], ["gelatinous_octahedron", new Card(['gelatinous_octahedron', 'monster'])], ["ghoulfiends", new Card(['ghoulfiends', 'monster'])], ["half-breed", new Card(['half-breed', 'race'])], ["halfling", new Card(['halfling', 'race'])], ["harpies", new Card(['harpies', 'monster'])], ["help_me_out_here", new Card(['help_me_out_here', 'door'])], ["hippogriff", new Card(['hippogriff', 'monster'])], ["humungous_+10_to_monster", new Card(['humungous_+10_to_monster', 'door'])], ["illusion", new Card(['illusion', 'door'])], ["income_tax", new Card(['income_tax', 'curse'])], ["insurance_salesman", new Card(['insurance_salesman', 'monster'])], ["intelligent_+5_to_monster", new Card(['intelligent_+5_to_monster', 'door'])], ["king_tut", new Card(['king_tut', 'monster'])], ["lame_goblin", new Card(['lame_goblin', 'monster'])], ["large_angry_chicken", new Card(['large_angry_chicken', 'monster'])], ["lawyers", new Card(['lawyers', 'monster'])], ["leperchaun", new Card(['leperchaun', 'monster'])], ["lose_1_big_item", new Card(['lose_1_big_item', 'curse'])], ["lose_1_small_item", new Card(['lose_1_small_item', 'curse'])], ["lose_a_level", new Card(['lose_a_level', 'curse'])], ["lose_the_armor_you_are_wearing", new Card(['lose_the_armor_you_are_wearing', 'curse'])], ["lose_the_footgear_you_are_wearing", new Card(['lose_the_footgear_you_are_wearing', 'curse'])], ["lose_the_headgear_you_are_wearing", new Card(['lose_the_headgear_you_are_wearing', 'curse'])], ["lose_the_item_that_gives_you_the_biggest_bonus", new Card(['lose_the_item_that_gives_you_the_biggest_bonus', 'curse'])], ["lose_two_cards", new Card(['lose_two_cards', 'curse'])], ["lose_your_class", new Card(['lose_your_class', 'curse'])], ["lose_your_race", new Card(['lose_your_race', 'curse'])], ["malign_mirror", new Card(['malign_mirror', 'curse'])], ["mate", new Card(['mate', 'door'])], ["maul_rat", new Card(['maul_rat', 'monster'])], ["mr_bones", new Card(['mr_bones', 'monster'])], ["net_troll", new Card(['net_troll', 'monster'])], ["out_to_lunch", new Card(['out_to_lunch', 'door'])], ["pit_bull", new Card(['pit_bull', 'monster'])], ["platycore", new Card(['platycore', 'monster'])], ["plutonium_dragon", new Card(['plutonium_dragon', 'monster'])], ["potted_plant", new Card(['potted_plant', 'monster'])], ["pukachu", new Card(['pukachu', 'monster'])], ["shrieking_geek", new Card(['shrieking_geek', 'monster'])], ["snails_on_speed", new Card(['snails_on_speed', 'monster'])], ["squidzilla", new Card(['squidzilla', 'monster'])], ["stoned_golem", new Card(['stoned_golem', 'monster'])], ["super_munchkin", new Card(['super_munchkin', 'class'])], ["thief", new Card(['thief', 'class'])], ["tongue_demon", new Card(['tongue_demon', 'monster'])], ["tuba_of_charm", new Card(['tuba_of_charm', 'item'])], ["undead_horse", new Card(['undead_horse', 'monster'])], ["unspeakably_awful_indescribable_horror", new Card(['unspeakably_awful_indescribable_horror', 'monster'])], ["wandering_monster", new Card(['wandering_monster', 'door'])], ["wannabe_vampire", new Card(['wannabe_vampire', 'monster'])], ["warrior", new Card(['warrior', 'class'])], ["wight_brothers", new Card(['wight_brothers', 'monster'])], ["wizard", new Card(['wizard', 'class'])]];

  this.doors = new Deck(doors);
  this.dDis = new Deck();
  this.treas = new Deck(treasures);
  this.tDis = new Deck();
  this.field = new Deck();

  this.doors.dShuffle(); // shuffle doors
  this.treas.dShuffle(); // shuffle treasures
}

method.initPlayers = function(playerObj) {
  var gamePlayers = this.players;
  for (var player of playerObj) {
    this.addPlayer(player, [], []);
  }
}

method.getGameInfo = function() {
  var gameInfo = {players: [], doors: [], treas: []};
  for (var player of this.players.values()) {
    var playerInfo = [{name: player.name, gender: player.gender}, [], []];
    for (var name of player.hand.cards.keys()) {
      playerInfo[1].push(name);
    }
    for (var name of player.field.cards.keys()) {
      playerInfo[2].push(name);
    }
    gameInfo.players.push(playerInfo);
  }
  var doorNames = [];
  var treasNames = [];
  for (var door of this.doors.cards.keys()) {
    doorNames.push(door);
  }
  for(var treas of this.treas.cards.keys()) {
    treasNames.push(treas);
  }

  gameInfo.doors = doorNames;
  gameInfo.treas = treasNames;
  return gameInfo;
}

method.addPlayer = function(playerInfo, handNames, fieldNames) {
  var oldPlayerName = "player" + this.players.size.toString();
  var currPlayer = this.unsetPlayers.get(oldPlayerName);
  currPlayer.name = playerInfo.name;
  currPlayer.gender = playerInfo.gender;
  if (handNames.length + fieldNames.length > 0) {
    var handCards = this.findCards(handNames);
    var fieldCards = this.findCards(fieldNames);
    for (var card of handCards.values()) {
      card.setCard1(currPlayer.hand);
    }
    for (var card of fieldCards.values()) {
      card.setCard1(currPlayer.field);
    }
  } else {
    currPlayer.draw(this.doors, this.dDis, 4);
    currPlayer.draw(this.treas, this.tDis, 4);
    for (var card of currPlayer.hand.cards.keys()) {
      handNames.push(card);
    }
  }
  this.players.set(playerInfo.name, currPlayer);
  this.unsetPlayers.delete(oldPlayerName);
  return [playerInfo, handNames, fieldNames];
}

method.delPlayer = function(playerName) {
  var player = this.players.get(playerName);
  player.level = 1;
  player.strength = 1;
  player.handSize = 5;
  for (var deck of player.decks) {
    for (var card of deck.cards.values()) {
      if ('treasure item bonus'.indexOf(card.cardType) !== -1) {
        card.setCard1(this.treas);
        card.isEquipped = true;
      } else {
        card.setCard1(this.doors);
        card.isEquipped = true;
      }
    }
  }
  this.unsetPlayers.set("player" + (this.players.size - 1).toString(), player);
  this.players.delete(playerName);
}

method.kick = function() {
  var card = this.doors.selectCard('last');
  card.setCard1(this.field);
}

method.discard = function(cards) {
  cards = this.findCards(cards);

  for (var card of cards.values()) {
    if ('treasure item bonus'.indexOf(card.cardType) !== -1) {
      card.setCard1(this.tDis);
    } else {
      card.setCard1(this.dDis);
    }
  }
}

method.trade = function(playerName, oppName, cardNames, oppNames) {
  var player = this.players.get(playerName);
  var oppPlayer = this.players.get(oppName);
  var decks = [player.field, player.equipment];
  var oppDecks = [oppPlayer.field, oppPlayer.equipment];
  var cards = this.findCards(cardNames, decks);
  var oppCards = this.findCards(oppNames, oppDecks);

  player.trade(oppPlayer, cards, oppCards);
}

method.findCards = function(cardNames, decks) {
  cardNames = typeof cardNames !== 'undefined' ? cardNames : [];
  var cards = new Map();

  if (typeof decks === 'undefined') {
    var players = this.players;
    decks = [this.doors, this.dDis, this.treas, this.tDis, this.field];
    for (var player of players.values()) {
      decks = decks.concat(player.decks);
    }
  }

  for (var cardName of cardNames) {
    var card = null;
    for (var deck of decks) {
      if (card != null) {
        break;
      } else {
        card = deck.selectCard(cardName);
      }
    }
    if (card == null) {
    //error code
      console.log(cardName + ' not found');
    } else {
      cards.set(cardName, card);
    }
  }

  return cards;
}

// edit for expression list generation
method.lowestLevel = function() {
  var lowest = [];
  var levels = [];
  for (var player of this.players.values()) {
    levels.push(player.level);
  }
  var minLevel = min(levels);

  for(var player of this.players.values()) {
    if (player.level == minLevel) {
      lowestLevel.push(player.name);
    }
  }

  return minLevel, lowest;
}

method.nextTurn = function(resurrect) {
  var playerNumber = this.turn % this.players.size;
  var players = this.players.values();
  for (var i = 0; i < playerNumber; i++) {
    players.next();
  }
  this.round = new Round(this, players.next().value, resurrect);
}

method.endTurn = function() {
  this.turn += 1;
  this.round = null;
}

var method1 = Round.prototype;
function Round(game, player, resurrect) {
  resurrect = typeof resurrect !== 'undefined' ? resurrect : false;
  this.game = game;
  this.player = player;
  this.playerName = player.name;
  this.resurrect = resurrect;
  this.combat = null;

  if (!this.resurrect) {
    this.game.kick(this.playerName);

    var kickedCard = this.game.field.selectCard('last');
    if (kickedCard.cardType == "Monster") {
      this.combat = Combat(this, kickedCard);
    }
  }
}

method1.lookForTrouble = function(monsterName) {
  var monster = this.player.hand.cards.get(monsterName);
  monster.setCard(this.game.field);

  this.combat = Combat(this.game, monster);
}

method1.lootTheRoom = function() {
  this.player.draw(this.game.doors, this.game.dDis, 1);
}

method1.charity = function(otherPlayerName, cardNames) {
  var otherPlayer = this.game.players.get(otherPlayerName);
  var decks = [this.player.hand];
  var cards = this.game.findCards(cardNames, decks);

  for (var card of cards.values()) {
    card.setCard(otherPlayer.hand);
  }
}

method1.sell = function(treasureNames, levelIncrease) {
  this.player.level += levelIncrease;
  this.game.discard(treasureNames, [this.player.field]);
}

var method2 = Trade.prototype;
function Trade(game, player1, player2) {
  this.game = game;
  this.player1 = player1;
  this.player2 = player2;
  this.cards1 = new Deck();
  this.cards2 = new Deck();
}

var method3 = Combat.prototype;
function Combat(round, monster) {
  this.round = round;
  this.monsters = new Map();
  this.playerStr = 0;
  this.monsterStr = 0;
  this.helper = null;
  this.treasures = 0;
  this.levels = 0;

  this.addMonster(monster);
}

method3.addMonster = function(monsterName) {
  var monster = this.round.game.findCards([monsterName]);
  this.monsters.set(monsterName, monster);
  //this.changeTreasure(monster.actions['reward']['treasures']);
  //this.changeLevels(monster.actions['reward']['levels']);
  this.strength();
}

method3.removeMonster = function(monsterName) {
  this.monsters.delete(monsterName);
  this.strength();
}

method3.changeTreasure = function(amount) {
  this.treasures += amount;
}

method3.strength = function() {
  this.playerStr = this.player.strength;
}

method3.endCombat = function() {
  this.player.levels += this.levels;
  if (this.helper.hasRaceClass('Elf')) {
    this.player.level += 1;
  }
  if (this.helper == null) {
    this.player.draw(this.game.treasures, this.player.hand, this.treasures);
  } else {
    var treasures = new Deck();
    this.player.draw(this.game.treasures, treasures, this.treasures);
    this.game.t_rewards = treasures;
  }
  this.round.combat = null;
}

var method4 = Player.prototype;
function Player(name, gender) {
  this.name = name;
  this.gender = gender;
  this.level = 1;
  this.strength = 1;
  this.handSize = 5;
  this.races = new Deck();
  this.classes = new Deck();
  this.hand = new Deck();
  this.field = new Deck();
  this.equipment = new Deck();
  this.bonuses = new Deck();
  this.decks = [this.races, this.classes, this.hand, this.field, this.equipment, this.bonuses];
  //this.equip_types = ["hand", "hand", "head", "foot", "big"];
}

method4.hasRaceClass = function(cardName) {
  return this.races.cards.keys().indexOf(cardName) != -1 ||
    this.classes.cards.keys().indexOf(cardName) != -1;
}

method4.draw = function(deck1, deck2, num, names) {
  deck2 = typeof deck2 !== 'undefined' ? deck2 : null;
  names = typeof names !== 'undefined' ? names : null;
  if (names != null) {
    for (var cardName of names) {
      var card = deck1.selectCard(cardName);
      card.setCard1(this.hand);
    }
    deck1.dShuffle();
  } else {
    for (var i = 0; i < num; i++) {
      var card = deck1.selectCard('last');
      card.setCard1(this.hand);

      if (deck1.numCards == 0) {
        deck1.swap(deck2);
      }
    }
  }
}

method4.trade = function(player2, cards1, cards2) {
  cards1.forEach(function(name, card) {
    card.setCard(player2.hand);
  }, cards1);

  cards2.forEach(function(name, card) {
    card.setCard(this.hand);
  }, cards2);
}

var method5 = Deck.prototype;
function Deck(cards) {
  this.cards = new Map();
  if (typeof cards === 'undefined') {
    cards = [];
  }
  for (var card of cards) {
    card[1].setCard(this);
  }
  this.numCards = this.cards.size;
}

method5.add = function(card) {
  this.cards.set(card, card.name);
  this.numCards += 1;
}

method5.add1 = function(card) {
  this.cards.set(card.name, card);
  this.numCards += 1;
}

method5.remove = function(card) {
  this.cards.delete(card.name)
  this.numCards -= 1;
}

method5.selectCard = function(name) {
  try {
    if (name == 'last') {
      return this.cards.values().next().value;
    }
    return this.cards.get(name);
  }
  catch(err) {
    console.log('select card at index ' + name + ' not found');
    return null;
  }
}

method5.dShuffle = function() {
  var cardValues = [];
  this.cards.forEach(function(name, card) {
    cardValues.push([name, card]);
  });

  this.cards = new Map(this.shuffle(cardValues));
}

method5.shuffle = function(array) {
  var counter = array.length, temp, index;

  while (counter > 0) {
    index = Math.floor(Math.random() * counter);

    counter--;

    temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
} 

method5.swap = function(deck) {
  var deckCards = deck.cards.values();
  var cardValues = this.cards.values();
  for (var card of cardValues) {
    card.setCard(deck);
  }
  for (var card of deckCards) {
    card.setCard(this);
  }

  this.dShuffle();
  deck.dShuffle();
}

var method6 = Card.prototype;
function Card(init) {
  this.name = init[0];
  //this.cardInfo = cardInfo;
  this.deck = null;
  this.cardType = init[1];
  this.isEquipped = true;
}

method6.setCard = function(deck) {
  if (this.deck != null) {
    this.deck.remove(this);
  }
  deck.add(this);
  this.deck = deck;
}

method6.setCard1 = function(deck) {
  if (this.deck != null) {
    this.deck.remove(this);
  }
  deck.add1(this);
  this.deck = deck;
}