"use strict";
//require('v8-profiler');
require('./app/lib/Array.extend.js');
var server = require('./app/server.js');
var mongodb = require('./app/mongodb.js');
var User = require('./app/User.js');
var Game = require('./app/game/Game.js');
var PublicGame = require('./app/PublicGame.js');
var MultiplayerHandlers = require('./app/MultiplayerHandlers.js');
var GameConsole = require('./app/game-console.js');
var repl = require('repl');var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var cookie = require('cookie');

var users = [];
var games = [];

server.io.on('connection', function(socket) {
  var cookies = cookie.parse((socket.handshake || socket.request).headers.cookie);
  var sessionId = cookieParser.signedCookie(cookies['jlegends.sid'], 'jLegendsKeeper');
  mongodb.Session.findById(sessionId, function(err, result) {
    var session = JSON.parse(result.toJSON().session);
    if (session.account) {
      var alreadyConnected = false;
      for (var i = 0; i < users.length; i++) {
        if (users[i].information.id == session.account.id) {
          alreadyConnected = true;
          break;
        }
      }
      if (!alreadyConnected) {
        var user = new User(socket, {
          id: session.account.id,
          uuid: session.account.uuid,
          email: session.account.email,
          username: session.account.username
        });
        MultiplayerHandlers.call(user, games);
        users.push(user);
        socket.on('disconnect', function() {
          for (var i = 0; i < users.length; i++) {
            if (users[i].information.id == user.information.id) {
              users.removeAt(i);
              break;
            }
          }
        });
      } else { // already connected
        socket.emit('script', 'alert("Error: already connected");');
      }
    } else { // visitor
      Tutorial(socket);
    }
  });
});

var _;
var gameConsole = new GameConsole(function(script) {
  _ = eval(script);
  console.log(_);
});
// process.stdout.write("\u001b[2J\u001b[0;0H");
// var gameConsole = repl.start({
//   prompt: ">> ",
//   input: process.stdin,
//   output: process.stdout
// });
// gameConsole.context.users = users;
// gameConsole.context.games = games;

function getPublicGames() {
  return games.map(function(game) {
    return {
      id: game.id,
      details: game.instance.export()
    };
  });  
}

function onCreatePublicGame(account, options) {
  var user = null;
  for (var i = 0; i < users.length; i++) {
    if (users[i].information.id == account.id) {
      user = users[i];
      break;
    }
  }
  if (user) { // connected
    var publicGame = new PublicGame();
    games.push(publicGame);
    return publicGame.id;
  } else {
    return false;
  }
}

function Tutorial(socket) {
  var game = null;
  
  socket.on('tutorial:start', function() {
    game = new Game({ 
      sectors: 25, 
      players: [{ 
        type: 'warrior',
        level: 1,
        race: 'human', 
        position: { x: 10 } ,
        build: {
          vitality: 50
        }
      }]
    });
    socket.emit('tutorial:state', { game: game.export() });
  });
  
  socket.on('tutorial:execute', function(commands) {
    if (commands.length > 10) return;
    try {
      var played = game.engine.play(commands);
      if (played.length) {
        socket.emit('tutorial:playback', {
          turns: played
        });
        socket.emit('tutorial:state', { game: game.export() });  
      } else {
        socket.emit('tutorial:playback', null);
      }
    } catch(err) {
      // w00t?
    }
  });
  
  socket.on('tutorial:spawn', function(data) {
    game.npcs.add(data);
    socket.emit('tutorial:state', { game: game.export() });  
  });
  
  socket.on('disconnect', function() {
    game = null;
  });
}

server.start(1337, getPublicGames, onCreatePublicGame);