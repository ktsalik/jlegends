var app = angular.module('jlegends', [
  'ngMaterial',
  'btford.socket-io',
  'luegg.directives',
  'hljs',
  'controllers',
  'services',
  'directives',
  'routes'
]);

app.config(function($mdThemingProvider, $mdIconProvider) {
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
    
  $mdIconProvider.fontSet('md', 'material-icons');
});

var socket, game, canvas, editor;

app.run(function($rootScope, $urlRouter, socket) {
  window.socket = socket;
  $rootScope.$on('$stateChangeStart', function(e) {
    if (game) {
      socket.emit('game:quit');
      socket.emit('multiplayer:quit');
      canvas.game.destroy();
      game = null;
      canvas = null;
    }
    
    socket.removeListener('game:state');
    socket.removeListener('game:pong');
    socket.removeListener('game:playback');
    socket.removeListener('multiplayer:state');
    socket.removeListener('multiplayer:playback');
    socket.removeListener('disconnect');
    socket.removeListener('reconnect');
  });
  
  // new Fingerprint2().get(function(result) {
  //   socket.emit('fingerprint', result);
  // });
});

window.onerror = function(e) { alert(e.toString()); };

var latency = NaN;
var baseUrl = 'http://localhost:1337/';