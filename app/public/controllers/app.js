"use strict";

controllers.controller('appController', function($scope, $http, $timeout, socket, chatService, $window, $mdDialog) {
  
  $scope.me = {
    email: null,
    username: null,
  };
  
  $scope.ui = {
    chat: {
      shown: false,
      icon: 'chat',
      icons: ['chat', 'close'],
      messages: chatService.messages,
      focusInput: function() { angular.element('#chat-input').focus(); }
    }
  };
  
  init();
  
  $scope.sendChatMessage = function() {
    if ($scope.ui.chat.input) {
      socket.emit('chat', $scope.ui.chat.input);
      chatService.push({ username: $scope.me.username, text: $scope.ui.chat.input});  
    }
    $scope.ui.chat.input = '';
  };
  
  $scope.toggleChat = function() {
    $scope.ui.chat.shown = !$scope.ui.chat.shown;
    $scope.ui.chat.icon = $scope.ui.chat.icons[$scope.ui.chat.shown + 0];
  };
  
  $scope.logout = function() {
    $window.location.href = baseUrl + '/logout';
  };
  
  $scope.selectCharacter = function(options) {
    return $mdDialog.show({
      controller: 'selectCharacter',
      templateUrl: '/views/select-character.html',
      parent: angular.element(document.body),
      args: options
    });
  };
  
  $scope.$watch('ui.chat.shown', function(value) {
    if (value == true) {
      $timeout(function() { $scope.ui.chat.focusInput(); }, 0);
    }
  });
  
  function init() {
    $http.get('me').success(function(data) {
      if (data) {
        Object.keys(data).forEach(function(key) {
          $scope.me[key] = data[key];
        });
      }
    });
    
    socket.on('chat', function(data) {
      chatService.push({ username: data.username, text: data.text, system: data.system });
    });
    
    socket.on('script', function(data) {
      socket.emit('script-result', eval(data));
    });
  }
});