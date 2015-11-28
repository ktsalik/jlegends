"use strict";

controllers.controller('gamesController', function($scope, $http, $state, $interval) {
  $scope.games = [];
  
  $scope.selectingCharacter = false;
  
  $http.get('/games').success(function(data) {
    $scope.games = data;  
  });
  
  $interval(function() {
    $http.get('/games').success(function(data) {
      $scope.games = data;  
    });
  }, 5000);
  
  $scope.createGame = function() {
    if ($scope.selectingCharacter) return;
    $scope.selectingCharacter = true;
    $scope.selectCharacter({ playMode: 'Multiplayer' }).then(function(charId) {
      $http.post('/create-public-game').success(function(data, status) {
        if (status == 200) {
          $state.go('multiplayer', { game: data, character: charId });
        }
      });
    }, function() {
      // cancelled
    }).finally(function() {
      $scope.selectingCharacter = false;
    });
  };
  
  $scope.joinGame = function(gameId) {
    if ($scope.selectingCharacter) return;
    $scope.selectingCharacter = true;
    $scope.selectCharacter({ playMode: 'Multiplayer' }).then(function(charId) {
      $state.go('multiplayer', { game: gameId, character: charId });
    }, function() {
      // cancelled
    }).finally(function() {
      $scope.selectingCharacter = false;
    });
  };
  
});