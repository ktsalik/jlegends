"use strict";
var Player = require('./Player.js');
var Npc = require('./Npc.js');

var Tactics = function(me) {
  var game = this;
  
  me.tactics = {};
  
  me.tactics.get = {
    enemies: function() {
      if (me instanceof Player) {
        return game.npcs.filter(function(npc) {
          return npc.hp > 0;
        });
      } else if (me instanceof Npc) {
        return game.players.filter(function(player) {
          return player.hp > 0;
        });
      } else {
        return null;
      }
    }
  };
};

module.exports = Tactics;