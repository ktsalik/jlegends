"use strict";

var Entropy = require('./Entropy');

var Engine = function(game) {
  
  this.play = function(commands, multiple) {
    
    switch (game.type) {
      case 'single-player':
        if (game.players.every(function(player) { return player.hp === 0; }) || game.npcs.length === 0 || game.npcs.every(function(npc) { return npc.hp === 0; })) {
          //return false;
        }
      break;
      case 'multiplayer':
        if (game.players.every(function(player) { return player.hp === 0; }) || game.npcs.length === 0 || game.npcs.every(function(npc) { return npc.hp === 0; })) {
          //return false;
        }
      break;
    }

    var played = [];
    
    game.players.forEach(function(player) {
      if (player.hp > 0) {
        var turn;
        if (multiple) {
          turn = play.player.call(game, player, commands.getBy('character', player.id).commands);  
        } else {
          turn = play.player.call(game, player, commands);  
        }
        if (turn) {
          played.push(turn);
        }
      }
    });
    
    // AI's turn
    if (game.npcs.some(function(npc) { return npc.hp > 0; })) {
      for (var i = 0; i < game.npcs.length; i++) {
        if (game.npcs[i].hp > 0) {
          var turn = play.npc.call(game, game.npcs[i]);
          if (turn) {
            played.push(turn);  
          }
        }
      }
    }
    
    Entropy.call(game, played);
    
    return played;
  };
};

var play = {
  player: function(player, commands) {
    var actionsPlayed = [];
    if (!Array.isArray(commands)) {
      // possible hack
      return false;
    }
    commands.forEach(function(command) {
      var exec = null;
      var afterEffects = [];
      switch (command.type) {
        case 'move':
          if (typeof command.to === 'number') {
            exec = player.actions.moveTo(command.to);
          } else {
            var target = this.entities.getBy('id', command.to);
            exec = player.actions.moveCloseTo(target);
          }
        break;
        case 'attack':
          var target = this.entities.getBy('id', command.target);
          exec = player.actions.attack(target, afterEffects);
        break;
        case 'cast':
          var target = this.entities.getBy('id', command.target);
          exec = player.actions.cast(command.spell, target, afterEffects);
        break;
        case 'use':
          var target = this.entities.getBy('id', command.target);
          exec = player.actions.use(command.skill, target, afterEffects);
        break;
        case 'rest':
          exec = player.actions.rest(afterEffects);
        break;
      }
      if (exec === null) {}// console.log("invalid command: " + JSON.stringify(command));
      else if (exec === false) {}// console.log("can't do this: " + JSON.stringify(command));
      else {
        switch (command.type) {
          case 'move':
            actionsPlayed.push({
              type: 'move',
              position: { x: player.position.x },
              afterEffects: afterEffects
            });
          break;
          case 'attack':
            actionsPlayed.push({
              type: 'attack',
              target: target.id,
              damage: exec,
              afterEffects: afterEffects
            });
          break;
          case 'cast':
            actionsPlayed.push({
              type: 'cast',
              spell: command.spell,
              target: target.id,
              damage: exec,
              afterEffects: afterEffects
            });
          break;
          case 'use':
            actionsPlayed.push({
              type: 'use',
              skill: command.skill,
              target: (target || {}).id,
              damage: exec,
              afterEffects: afterEffects
            });
          break;
          case 'rest':
            actionsPlayed.push({
              type: 'rest',
              afterEffects: afterEffects
            });
          break;
        }
      }
    }.bind(this));
    if (actionsPlayed.length) 
      return {
        actor: 'player.' + player.id,
        actions: actionsPlayed
      };
  },
  npc: function(npc) {
    var actionsPlayed = [];
    var afterEffects = [];
    
    function moveRandom() {
      var randomIn = function(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
      var movePoint = randomIn(npc.startPoint - npc.patrolRange, npc.startPoint + npc.patrolRange);
      if (npc.actions.moveTo(movePoint))
        actionsPlayed.push({ type: 'move', position: { x: npc.position.x }});
    }
    
    function calculateAgro() {
      var enemies = npc.tactics.get.enemies();
      // reset agro according to the current distance
      npc.agro.forEach(function(agro) {
        var character = enemies.getBy('id', agro.character);
        if (!character || Math.abs(npc.orientation.distanceFrom(character)) >= npc.resetAgroRange)
          agro.value = 0;
      });
      for (var i = 0; i < npc.agro.length; i++) if (npc.agro[i].value === 0) npc.agro.splice(i--, 1);
      
      // enable agro for enemies in range
      enemies.forEach(function(enemy) {
        var distance = Math.abs(npc.orientation.distanceFrom(enemy));
        if (distance <= npc.agroRange)
          npc.agro.push({ character: enemy.id, value: 100 });
      });
    }
    
    function attackByAgro() {
      if (npc.agro.length === 0) return NaN;
      var enemies = npc.tactics.get.enemies();
      var target;
      for (var i = 0; i < enemies.length; i++) if (enemies[i].id == npc.agro[0].character) target = enemies[i];
      
      if (npc.actions.moveInRange(target))
        actionsPlayed.push({ type: 'move', position: { x: npc.position.x } });
      var damage = npc.actions.attack(target, afterEffects);
      if (typeof damage === 'number')
        actionsPlayed.push({ type: 'attack', target: target.id, damage: damage, afterEffects: afterEffects });
      return damage;
    }
    
    calculateAgro();
    if (Number.isNaN(attackByAgro())) {
      moveRandom();
      calculateAgro();
      attackByAgro();
    }
    
    if (actionsPlayed.length) {
      return {
        actor: 'npc.' + npc.id,
        actions: actionsPlayed
      };
    }
  }
};

module.exports = Engine;