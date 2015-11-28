var app = angular.module('jlegends-tutorial', [
  'ngMaterial',
  'btford.socket-io',
  'hljs'
]);

app.factory('socket', function(socketFactory) {
  return socketFactory();
});

app.controller('tutorialController', function($scope, socket) {
  
  $scope.tutorial = {
    game: null,
    canvas: null,
    step: 0,
    nextNext: '',
    nextShown: true,
    playShown: false,
    finished: false
  };
  
  $scope.titles = [
    "Welcome to jLegends Tutorial",
    "Know yourself...",
    "Starting with a small step...",
    "Keep moving...",
    "Know your enemy...",
    "Make your move...",
    "Don't stand looking...",
    "Take your time...",
    "This is just the begining..."
  ];
  
  $scope.texts = [
    "This tutorial will guide you through the basic concepts of the game.",
    "See this brave warrior? That's you!",
    "You can move around the battlefield using \"move\" method. Give it a try!",
    "You can move into different directions for the given number of steps (in meters).",
    "\"getEnemy\" method returns your enemy. Use this to store your enemy into an object.",
    "In order to (physically) attack the enemy you need to get closer (in range).",
    "use \"attack\" method to attack the enemy!",
    "You can always back off and use \"rest\" method in order to gain some hp back.",
    "Well done! You finished this quick tutorial. There are much more exciting things to discover playing jLegends."
  ];
  
  $scope.codes = [
    "",
    "",
    "move('right', 1);",
    "move('left', 2);\nmove('right', 3);",
    "var enemy = getEnemy();\nalert('enemy hp: ' + enemy.hp);\nalert('enemy strength: ' + enemy.strength);",
    "var enemy = getEnemy();\nmoveTo(enemy);",
    "var enemy = getEnemy();\nmoveTo(enemy);\nattack(enemy);",
    ""
  ];
  
  $scope.tips = [
    "",
    "",
    "Using \"move\" method without a second parameter makes your character move to the end of the given direction",
    "Only 2 actions per turn are allowed",
    "\"getEnemies\" method returns an array of all your enemies",
    "As a ranger you shouldn't use this. A ranger's attack range is 4 instead of 1",
    "\"inRange\" method is usefull before attacking",
    "\"You need to be away from enemies range in order to rest"
  ];
  
  $scope.next = function() {
    $scope.tutorial.step++;
  };
  
  $scope.$watch('tutorial.step', function(step) {
    $scope.tutorial.nextText = ['continue', 'got it', 'next'][Math.floor(Math.random() * 3)];
    switch (step) {
      case 2:
        $scope.tutorial.nextShown = false;
        $scope.tutorial.playShown = true;
        $scope.editor.setValue("move('right', 1);");
      break;
      case 3:
        $scope.tutorial.nextShown = false;
        $scope.tutorial.playShown = true;
        $scope.editor.setValue("move('left', 2);\nmove('right', 3);");
      break;
      case 4:
        $scope.tutorial.nextShown = false;
        $scope.tutorial.playShown = true;
        socket.emit('tutorial:spawn', {
          race: 'orc',
          type: 'warrior',
          position: { x: $scope.game.players[0].position.x < ($scope.game.sectors / 2) ? 20 : 10 }
        });
        $scope.editor.setValue("var enemy = getEnemy();\nalert('enemy hp: ' + enemy.hp);");
      break;
      case 5:
        $scope.tutorial.nextShown = false;
        $scope.tutorial.playShown = true;
        $scope.editor.setValue("var enemy = getEnemy();\nmoveTo(enemy);");
      break;
      case 6:
        $scope.tutorial.nextShown = false;
        $scope.tutorial.playShown = true;
        $scope.editor.setValue("var enemy = getEnemy();\nmoveTo(enemy);\nattack(enemy);");
      break;
      case 7:
        $scope.tutorial.nextShown = false;
        $scope.tutorial.playShown = true;
        $scope.editor.setValue("if (me.hp < 600) { // 600 is full hp\n  move('left', 3);\n  rest();\n} else {\n  var enemy = getEnemy();\n  moveTo(enemy);\n  attack(enemy);\n}");
      break;
      case 8:
        $scope.tutorial.finished = true;
        $scope.tutorial.playShown = true;
      break;
      default: 
        $scope.editor.setValue('');
      break;
    }
  });
  
  init();
  
  $scope.execute = function() {
    if ($scope.canvas && $scope.canvas.ready) {
      for (var i = 0; i < $scope.editor.lineCount(); i++) $scope.editor.removeLineClass(i, 'background', 'line-error');
      try {
        var output = Sandbox($scope.game, $scope.game.players[0], $scope.editor.getValue());
        socket.emit('tutorial:execute', output);
      } catch (err) {
        try {
          var line = err.stack.toString().split('\n')[1];
          if (line.indexOf('play')) {
            line = line.split(',')[1].split(':')[1];
            $scope.editor.addLineClass(line - 1, 'background', 'line-error');  
          }
        } catch (err) {}
        Messenger().post({
          message: err,
          type: 'error',
          showCloseButton: true,
          id: 'code-error'
        });
      }
    }
  };
  
  function init() {
    socket.on('tutorial:state', function(data) {
      if (!$scope.game) {
        $scope.game = new Game(data.game.players[0].id);
        $scope.game.sectors = data.game.sectors;
        $scope.game.players = [new Player()];
        $scope.game.players[0].update(data.game.players[0]);
        window.me = $scope.game.players[0];
        $scope.canvas = new Canvas($scope.game, {
          width: $('#canvas').width(),
          height: $('#canvas').height()
        });
        $scope.canvas.on('tweens.started', function() {
          $scope.tutorial.playShown = false;
          $scope.$apply();
        });
        $scope.canvas.on('tweens.empty', function() {
          $scope.tutorial.nextShown = true;
          if ($scope.tutorial.finished)
            $scope.tutorial.playShown = true;
          $scope.$apply();
        });
      } else {
        $scope.game.players[0].update(data.game.players[0]);
        data.game.npcs.forEach(function(options) {
          var npc = $scope.game.npcs.getBy('id', options.id);
          if (!npc) {
            var npc = new Npc();
            npc.update(options);
            $scope.game.npcs.push(npc);
            $scope.canvas.spawn.npc(npc);
          } else {
            npc.update(options);
          }
        });
        // remove ghost npcs
        $scope.game.npcs.forEach(function(npc, i) {
          if (data.game.npcs.getBy('id', npc.id) === null) $scope.game.npcs.removeAt(i);
        });
      }
      $scope.$apply();
    });
    
    socket.on('tutorial:playback', function(data) {
      if (data) {
        data.turns.forEach(function(turn) { $scope.canvas.play(turn); });
      }
    });
    
    socket.emit('tutorial:start');
  }
  
});

app.directive('codeEditor', function() {
  return {
    replace: true,
    template: '<textarea></textarea>',
    link: function(scope, element, attrs) {
      scope.editor = CodeMirror.fromTextArea(element[0], {
        mode: 'javascript',
        lineNumbers: true,
        theme: 'material',
        'font-family': 'source-code',
        tabSize: 2
      });
      scope.editor.on('focus', function() { for (var i = 0; i < scope.editor.lineCount(); i++) scope.editor.removeLineClass(i, 'background', 'line-error'); });
    }
  };
});

app.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('indigo')
    .accentPalette('amber')
    .warnPalette('red')
    
  var successPalette = $mdThemingProvider.extendPalette('green', {
    '600': '#43A047'
  });
  $mdThemingProvider.definePalette('success', successPalette);
  
  $mdThemingProvider.theme('altTheme')
    .primaryPalette('success')
});