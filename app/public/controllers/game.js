"use strict";

controllers.controller('gameController', function($scope, $stateParams, socket, $state, $mdDialog, $timeout, $http, $interval) {

  $scope.controls = {
    play: {
      auto: false,
      disabled: true,
      codeErrorMessage: null
    }
  };
  
  $scope.game = {
    instance: null
  };
  var pingInterval;
  
  $scope.character = {
    id: $stateParams.character,
    instance: null
  };
  
  init();
  
  $scope.play = function() {
    if (canvas && canvas.ready) {
      for (var i = 0; i < editor.lineCount(); i++) editor.removeLineClass(i, 'background', 'line-error');
      if ($scope.play.codeErrorMessage) $scope.play.codeErrorMessage.cancel();
      try {
        var output = Sandbox(game, game.players.getBy('id', $scope.character.id), editor.getValue());
        socket.emit('game:play', output);
        $scope.controls.play.disabled = true;
      } catch (err) {
        $scope.controls.play.disabled = false;
        $scope.controls.play.auto = false;
        try {
          var line = err.stack.toString().split('\n')[1];
          if (line.indexOf('play')) {
            line = line.split(',')[1].split(':')[1];
            editor.addLineClass(line - 1, 'background', 'line-error');  
          }
        } catch (err) {}
        $scope.play.codeErrorMessage = Messenger().post({
          message: err,
          type: 'error',
          showCloseButton: true,
          id: 'code-error'
        });
      }
    }
  };
  
  $scope.quit = function() {
    if (confirm('Leave this game?')) {
      socket.emit('game:quit');
      if (game) {
        canvas.game.destroy();
        canvas = null
        game = null;
        $scope.game.instance = null;
      }
      $interval.cancel(pingInterval);
      $state.go('dashboard');
    }
  };
  
  $scope.addPoint = function(prop) {
    socket.emit('game:command', {
      type: 'add-point',
      point: prop
    });
  };
  
  $scope.$watch('character.instance.level', function(level) {
    if (angular.isNumber(level)) {
      calculateAvailablePoints();
    }
  });
  ['strength', 'agility', 'vitality', 'energy'].forEach(function(prop) {
    $scope.$watch('character.instance.' + prop, function(val) { if (angular.isNumber(val)) calculateAvailablePoints(); }); 
  });
  
  function calculateAvailablePoints() {
    var basePoints = 40; // base values
    var currentPoints = ['strength', 'agility', 'vitality', 'energy'].map(function(prop) { return $scope.character.instance[prop]; }).sum(); // points now
    var totalAvailablePoints = ($scope.character.instance.level - 1) * 2; // 2 points per level
    $scope.character.pointsAvailable = totalAvailablePoints > (currentPoints - 40);
  }
  
  $scope.saveCode = function() {
    $http.put('/code', { character: $scope.character.instance.id, code: editor.getValue() }).success(function(data, status) {
      Messenger({
        extraClasses: 'messenger-fixed messenger-on-left messenger-on-bottom'
      }).post({
        message: 'Code saved',
        type: 'success',
        showCloseButton: true,
        hideAfter: 1.5,
        parentLocations: $('#code-container')
      });
    });
  };
  
  $scope.$watch('game.instance', function(instance) {
    $scope.controls.play.disabled = instance === null;
    $scope.controls.play.auto = false;
  });
  
  $scope.$watch('ui.chat.shown', function(shown) {
    setTimeout(function() {
      if (canvas && canvas.game.scale) {
        canvas.game.scale.refresh();
      }
    }, 100);
  });
  
  
  function init() {
    socket.on('game:state', function(data) {
      if (!game) {
        game = new Game($scope.character.id);
        game.sectors = data.game.sectors;
        data.game.players.forEach(function(options) {
          var player = new Player();
          player.update(options);
          game.players.push(player);
        });
        data.game.npcs.forEach(function(options) {
          var npc = new Npc();
          npc.update(options);
          game.npcs.push(npc);
        });
        $scope.character.instance = game.players.getBy('id', $scope.character.id);
        $scope.game.instance = game;
        canvas = new Canvas(game, {
          width: $('#canvas').width(),
          height: $('#canvas').height()
        });
        canvas.on('tweens.started', function() {
          $scope.controls.play.disabled = true;
          $scope.$apply();
        });
        canvas.on('tweens.empty', function() {
          $scope.controls.play.disabled = false;
          $scope.$apply();
          if ($scope.controls.play.auto) {
            $scope.play();
          }
        });
      } else {
        data.game.players.forEach(function(options) {
          var player = game.players.getBy('id', options.id);
          if (!player) {
            player = new Player();
            player.update(options);
            game.players.push(player);
            if (!canvas.animating)
              canvas.spawn.player(player);
          } else {
            player.update(options);
          }
        });
        game.players.forEach(function(player, i) {
          if (data.game.players.getBy('id', player.id) === null) {
            game.players.removeAt(i);
            if (!canvas.animating)
              canvas.players.getBy('id', player.id).remove();
          }
        });
        $scope.character.instance = game.players.getBy('id', $scope.character.id);
        data.game.npcs.forEach(function(options) {
          var npc = game.npcs.getBy('id', options.id);
          if (!npc) {
            npc = new Npc();
            npc.update(options);
            game.npcs.push(npc);
            if (!canvas.animating)
              canvas.spawn.npc(npc);
          } else {
            npc.update(options);
          }
        });
        game.npcs.forEach(function(npc, i) {
          if (data.game.npcs.getBy('id', npc.id) === null) game.npcs.removeAt(i);
        });
      }
      $scope.$apply();
    });
    
    socket.on('game:playback', function(data) {
      console.log(data);
      if (data) {
        data.turns.forEach(function(turn) { canvas.play(turn); });
      } else {
        $scope.controls.play.disabled = false;
        $scope.controls.play.auto = false;
        $scope.$apply();
      }
    });
    
    socket.on('game:pong', function() {
      latency = new Date().getTime() - $scope.ping;
    });
    
    pingInterval = $interval(function() {
      if (['gameController', 'multiplayerController'].indexOf($state.current.controller) == -1) $interval.cancel(pingInterval);
      else if (socket.connected) {
        $scope.ping = new Date().getTime();
        socket.emit('game:ping');
      }
    }, 1000);
    
    socket.on('reconnect', function() {
      socket.emit('game:new', {
        type: 'single-player',
        character: $scope.character.id
      });
    });
    
    socket.on('disconnect', function() {
      if (game) {
        canvas.game.destroy();
        canvas = null;
        game = null;
        $scope.game.instance = null;
        $scope.$apply();
      }
    });

    socket.emit('game:new', {
      type: 'single-player',
      character: $scope.character.id
    });
  }
  
});