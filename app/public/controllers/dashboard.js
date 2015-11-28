"use strict";

controllers.controller('dashboardController', function($scope, $state) {
  
  $scope.playSinglePlayer = function() {
    $scope.selectCharacter({ playMode: 'Single Player' }).then(function(charId) {
      $state.go('game', { character: charId });
    }, function() {
      // cancelled
    });
  };
});