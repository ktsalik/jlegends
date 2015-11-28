"use strict";

var Player = require('./Player.js');

var Entropy = function(turnsPlayed) {
  /**
   * Mana Recovery
   */
  this.entities.forEach(function(entity) {
    if (typeof entity.mp === 'number') {
      var manaGain = entity.mana * 0.05;
      if (entity.mp + manaGain > entity.mana) manaGain = entity.mana - entity.mp;
      entity.mp += manaGain;
    }
  });
   
   /**
   * Buffs Tick
   */
   this.entities.forEach(function(entity) {
     if (entity.hp > 0) {
       entity.buffs.tick(); 
     } else {
       if (entity.buffs.count) { // remove buffs
         entity.buffs.clear(); 
       }
       if (entity instanceof Player && !Number.isFinite(entity.revive)) { // start revive countdown
         entity.revive = 3;
       } else {
         if (entity.revive-- === 0) { // time to revive
           entity.hp = entity.life;
           entity.revive = null;
         }
       }
     }
   });
  
  /**
   * Clear NPCs
   */
  for (var i = 0; i < this.npcs.length; i++) {
    if (this.npcs[i].hp === 0) {
      var xp = this.npcs[i].level * 10;
      this.players.forEach(function(player) {
        if (player.hp > 0) {
          player.addExperience(xp);  
        }
      });
      this.npcs.splice(i--, 1);
    }
  }

  if (this.npcs.count === 0) {
    switch (this.type) {
      case 'single-player':
        var player = this.players[0];
        var mobs = [
          {
            type: 'warrior', race: 'orc', level: player.level > 1 ? player.level - 1 : 1, position: { x: 15 }
          },
          {
            type: 'warrior', race: 'orc', level: player.level, position: { x: 15 }
          },
          {
            type: 'ranger', race: 'undead', level: player.level, position: { x: 15 }
          },
        ];
        this.npcs.add(mobs.random());
      break;
      case 'multiplayer':
        var minimumLevel = this.players.first.level;
        for (var i = 1; i < this.players.count; i++) {
          if (this.players[i].level < minimumLevel)
            minimumLevel = this.players[i].level;
        };
        var mobs = [
          {
            type: 'warrior', race: 'orc', level: minimumLevel > 1 ? minimumLevel - 1 : 1, position: { x: 15 }
          },
          {
            type: 'warrior', race: 'orc', level: minimumLevel, position: { x: 15 }
          },
          {
            type: 'ranger', race: 'undead', level: minimumLevel, position: { x: 15 }
          },
        ];
        [this.players.length].times(function() {
          this.npcs.add(mobs.random());
        }.bind(this));
      break;
    }
  }
  
};

module.exports = Entropy;