"use strict";

var mongodb = require('./mongodb.js');
var shortid = require('shortid');
var Game = require('./game/Game.js');

var User = function(socket, information) {
  this.information = {
    id: information.id,
    uuid: information.uuid,
    email: information.email,
    username: information.username,
    fingerprint: information.fingerprint || null
  };
  this.game = null;
  this.socket = socket;
  
  var self = this;
  
  socket.join('public', function(err) {
    if (!err) {
      socket.emit('chat', {
        username: '',
        text: 'Joined public channel',
        system: true
      });
    }
  });
  
  // socket.on('chat', function(data) { // handled in MultiplayerHandlers
  //   socket.to('public').emit('chat', { username: self.information.username, text: data });
  // });
  
  socket.on('game:new', function(options) {
    mongodb.Character.findById(options.character).populate({ path: '_user', match: { _id: self.information.id } }).exec(function(err, character) {
      if (character) {
        options.character = character.toObject();
        self.game = createNewGame(options);
        self.game.publish = function() {
          socket.emit('game:state', { game: self.game.export() });
        };
        Object.defineProperty(self.game, 'player', { get: function() { return this.players.getBy('id', options.character.id); } });
        self.game.player.onDing = function() {
          mongodb.Character.findByIdAndUpdate(self.game.player.id, { level: self.game.player.level }).exec();
        };
        self.game.publish();
      }
    });
  });
  
  socket.on('game:play', function(commands) {
    if (commands.length > 10) return;
    try {
      var played = self.game.engine.play(commands);
      if (played.length) {
        socket.emit('game:playback', {
          turns: played
        });
        mongodb.Character.findByIdAndUpdate(self.game.player.id, { experience: self.game.player.experience }).exec();
        socket.emit('game:state', { game: self.game.export() });  
      } else {
        socket.emit('game:playback', null);
      }
    } catch(err) {
      console.log(err.stack);
    }
  });
  
  socket.on('game:ping', function() {
    socket.emit('game:pong');
  });
  
  socket.on('game:command', function(command) {
    switch (command.type) {
      case 'add-point':
        var currentPoints = ['strength', 'agility', 'vitality', 'energy'].map(function(prop) { return self.game.player[prop]; }).sum();
        var totalAvailablePoints = (self.game.player.level - 1) * 2;
        if ((currentPoints - 40) < totalAvailablePoints) {
          mongodb.Character.findById(self.game.player.id, function(err, character) {
            if (character) {
              character.build[command.point]++;
              character.save(function(err, character) {
                if (!err) {
                  self.game.player[command.point]++;
                  socket.emit('game:state', { game: self.game.export() });
                }
              });
            }
          });
        }
      break;
    }
  });
  
  socket.on('script-result', console.log);
  
  socket.on('game:quit', function() {
    self.game = null;
  });
  
  socket.on('disconnect', function() {
    self.game = null;
  });
  
  socket.on('fingerprint', function(fingerprint) {
    self.information.fingerprint = fingerprint;
    mongodb.Fingerprint.count({ fingerprint: fingerprint }, function(err, count) {
      if (err || !count) mongodb.Fingerprint.create({ fingerprint: fingerprint, _user: self.information.id });
    });
  });
};

module.exports = User;

function createNewGame(options) {
  var game = new Game({ 
    type: options.type,
    sectors: 25,
    players: [
      { 
        id: options.character.id,
        name: options.character.name,
        type: options.character.class,
        level: options.character.level,
        experience: options.character.experience,
        build: options.character.build,
        race: 'human', 
        position: { x: 1 } 
      }
    ]
  });
  game.id = shortid.generate();
  game.npcs.add({ type: 'warrior', race: 'orc', position: { x: 15 }, level: options.character.level });
  return game;
}