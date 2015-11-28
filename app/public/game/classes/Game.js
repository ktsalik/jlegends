"use strict";

var Game = function(charId) {
  this.sectors = null;
  this.players = [];
  this.npcs = [];
  Object.defineProperty(this, 'entities', { get: function() { return this.players.concat(this.npcs); } });
  
  Object.defineProperty(this, 'character', {
    get: function() {
      return this.players.getBy('id', charId);
    }
  });
};