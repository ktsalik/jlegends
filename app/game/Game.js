"use strict";
var Engine = require('./Engine.js');
var Player = require('./Player.js');
var Npc = require('./Npc.js');
var Orientation = require('./Orientation.js');
var Tactics = require('./Tactics.js');
var Actions = require('./Actions.js');

var Game = function(options) {
  this.sectors = options.sectors;
  this.engine = new Engine(this);
  this.type = options.type || 'sandbox';
  
  this.players = [];
  this.players.add = function(options) {
    var player = new Player(options);
    Orientation.call(this, player);
    Tactics.call(this, player);
    Actions.call(this, player);
    this.players.push(player);
  }.bind(this);
  
  this.npcs = [];
  this.npcs.add = function(options) {
    var npc = new Npc(options);
    Orientation.call(this, npc);
    Tactics.call(this, npc);
    Actions.call(this, npc);
    this.npcs.push(npc);
  }.bind(this);
  
  if (options.players) {
    options.players.forEach(function(options) {
      this.players.add(options);
    }.bind(this));
  }
  
  if (options.npcs) {
    options.npcs.forEach(function(options) {
      this.npcs.add(options);
    }.bind(this));
  }
  
  Object.defineProperty(this, 'entities', { get: function() { return this.players.concat(this.npcs); } });
};

/**
 * EXPORT METHOD
 */
Game.prototype.export = function() {
  var players = this.players.map(function(player) {
    var playerExport = {
      id: player.id,
      name: player.name,
      race: player.race,
      type: player.type,
      position: player.position,
      buffs: player.buffs
    };
    
    for (var property in player) {
      if (typeof player[property] === 'number')
        playerExport[property] = player[property];
    }
    
    return playerExport;
  });
  
  var npcs = this.npcs.map(function(npc) {
    var npcExport = {
      id: npc.id,
      name: npc.name,
      race: npc.race,
      type: npc.type,
      position: npc.position,
      buffs: npc.buffs
    };
    for (var property in npc) {
      if (typeof npc[property] === 'number')
        npcExport[property] = npc[property];
    }
    return npcExport;
  });
  
  return {
    sectors: this.sectors,
    players: players,
    npcs: npcs
  };
};

module.exports = Game;