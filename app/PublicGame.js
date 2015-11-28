"use strict";

var shortid = require('shortid');
var Game = require('./game/Game.js');
var mongodb = require('./mongodb.js');

var PublicGame = function() {
  var self = this;
  
  this.id = shortid.generate();
  
  this.instance = new Game({
    sectors: 25,
    type: 'multiplayer',
    npcs: [{ type: 'warrior', race: 'orc', position: { x: 15 }, level: 1 }]
  });
  
  this.users = [];
  
  this.publish = function() {
    this.users.forEach(function(user) {
      user.socket.emit('multiplayer:state', { game: self.instance.export() });
    });
  };
  
  this.submissions = [];
  this.submissions.submit = function(submission) {
    if (this.getBy('character', submission.character) === null) { // if not already submitted
      this.push(submission);
      if (this.length == self.instance.players.count) { // everyone submitted
        playMultiple(this);
        this.length = 0;
      }
    }
  };
  
  function playMultiple(commands) {
    try {
      var played = self.instance.engine.play(commands, true); // true for multiple
      if (played.length) {
        
        self.instance.players.forEach(function(player) {
          mongodb.Character.findByIdAndUpdate(player.id, { experience: player.experience }).exec(); 
        });
        
        self.users.forEach(function(user) {
          user.socket.emit('multiplayer:playback', { turns: played });
          user.socket.emit('multiplayer:state', { game: self.instance.export() }); 
        });
        
      } else {
        self.users.forEach(function(user) {
          user.socket.emit('multiplayer:playback', null);
        });
      }
    } catch(err) {
      console.log(err.stack);
    }
  }
};

module.exports = PublicGame;