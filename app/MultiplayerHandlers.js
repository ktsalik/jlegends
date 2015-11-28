"use strict";

var mongodb = require('./mongodb.js');

var MultiplayerHandlers = function(games) {
  var user = this;
  var socket = this.socket;

  var game = null;

  socket.on('multiplayer:join', function(data) {
    game = games.getBy('id', data.gameId);
    if (game) {
      var alreadyJoined = game.instance.players.getBy('id', data.character) !== null;
      if (!alreadyJoined) {
        mongodb.Character.findOne({ _user: user.information.id, _id: data.character }, function(err, character) {
          if (!err && character) {
            character = character.toObject();
            game.instance.players.add({
              id: character.id,
              name: character.name,
              type: character.class,
              level: character.level,
              experience: character.experience,
              build: character.build,
              race: 'human', 
              position: { x: 1 }
            });
            game.instance.players.getBy('id', character.id).onDing = function() {
              mongodb.Character.findByIdAndUpdate(character.id, { level: game.instance.players.getBy('id', character.id).level }).exec();
            };
            game.users.push({
              character: character.id,
              socket: socket
            });
            socket.leave('public', function() {
              socket.join(game.id, function(err) {
                if (!err) {
                  socket.emit('chat', {
                    username: '',
                    text: 'Joined private game chat',
                    system: true
                  });
                }
              });
            });
            game.publish();
          }
        });
      } else {
        socket.emit('multiplayer:state', { game: game.instance.export() });
      }
    } else {
      // game doesn't exist
    }
  });
  
  socket.on('multiplayer:play', function(commands) {
    if (commands.length > 10) return;
    game.submissions.submit({ // store and wait for others
      character: game.users.findOne(function(user) { return user.socket.id == socket.id; }).character,
      commands: commands
    });
  });
  
  socket.on('multiplayer:quit', function() {
    handleLeave();
  });
  
  socket.on('disconnect', function() {
    handleLeave();
  });
  
  function handleLeave() {
    games.forEach(function(game) {
      game.users.forEach(function(user, i) {
        if (user.socket.id == socket.id) {
          game.users.removeAt(i);
          game.instance.players.removeBy('id', user.character);
          game.publish();
          socket.leave(game.id, function() {
            socket.join('public', function(err) {
              if (!err) {
                socket.emit('chat', {
                  username: '',
                  text: 'Joined public channel',
                  system: true
                });
              }
            });
          });
        }
      });  
      if (game.users.count === 0) {
        games.removeBy('id', game.id);
      }
    });
  }
  
  socket.on('multiplayer:command', function(command) {
    switch (command.type) {
      case 'add-point':
        var charId = game.users.findOne(function(user) { return user.socket.id == socket.id; }).character;
        var player = game.instance.players.getBy('id', charId);
        var currentPoints = ['strength', 'agility', 'vitality', 'energy'].map(function(prop) { return player[prop]; }).sum();
        var totalAvailablePoints = (player.level - 1) * 2;
        if ((currentPoints - 40) < totalAvailablePoints) {
          mongodb.Character.findById(player.id, function(err, character) {
            if (character) {
              character.build[command.point]++;
              character.save(function(err, character) {
                if (!err) {
                  player[command.point]++;
                  game.publish();
                }
              });
            }
          });
        }
      break;
    }
  });
  
  socket.on('chat', function(data) {
    if (socket.rooms.indexOf('public') > -1) {
      socket.to('public').emit('chat', { username: user.information.username, text: data });  
    } else {
      socket.to(game.id).emit('chat', { username: user.information.username, text: data });  
    }
  });
  
};

module.exports = MultiplayerHandlers;