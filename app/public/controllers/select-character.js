"use strict";

controllers.controller('selectCharacter', function($scope, $mdDialog, args, $http) {
  $scope.playMode = args.playMode;
  
  $scope.characters = [];
  
  $http.get('get-chars').success(function(data) {
    data.forEach(function(char) { $scope.characters.push(char); });
    if ($scope.characters.count > 0)
      $scope.characters.chosen = $scope.characters.first.id;
  });
  
  $scope.characters.new = {
    class: 'warrior',
    name: '',
    classes: ['warrior', 'ranger', 'priest', 'mage'],
    shown: false
  };
  
  $scope.createNew = function() {
    $http.post('create-char', {
      class: $scope.characters.new.class,
      name: $scope.characters.new.name
    }).success(function(data, status) {
      if (status == 200) {
        var newChar = data;
        $scope.characters.push(newChar);
        $scope.characters.chosen = newChar.id;
        $scope.characters.new.name = '';
        $scope.characters.new.shown = false;
      }
    });
  };
  
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.confirm = function() {
    $mdDialog.hide($scope.characters.chosen);  
  };
});