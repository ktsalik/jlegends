"use strict";

controllers.controller('gameUIController', function($scope, $mdDialog) {
  
  $scope.methodsWindow = {
    shown: false,
    selected: null
  };
  
  $scope.METHODS = METHODS;
  $scope.SPELLS = SPELLS;
  $scope.SKILLS = SKILLS;
  
  $scope.showMethods = function(category) {
    $mdDialog.show({
      controller: function($scope, $mdDialog, methods, category, $sce) {
        $scope.category = category;
        $scope.methods = methods;
        $scope.method = {};
        $scope.selected = Object.keys($scope.methods).first;
        $scope.method = $scope.methods[$scope.selected];
        $scope.select = function(name) {
          $scope.method = $scope.methods[name]; 
          $scope.selected = name;
        }
        $scope.close = function() { $mdDialog.hide(); };
      },
      templateUrl: '/views/docs-methods.html',
      parent: angular.element(document.body),
      clickOutsideToClose: true,
      category: category,
      methods: $scope.METHODS[category]
    });
  };
  
  $scope.showSpells = function(classType) {
    $mdDialog.show({
      controller: function($scope, $mdDialog, classType, spells) {
        $scope.classType = classType, $scope.spells = spells;
        $scope.close = function() { $mdDialog.hide(); };
      },
      template: '<md-dialog aria-label="docs-spells"><md-dialog-content>{{ classType | uppercase }} spells<md-divider></md-divider><md-list>' +
        '<md-list-item ng-repeat="spell in spells"><div hljs source="spell.example" language="javascript"></div></md-list-item>' +
        '</md-list></md-dialog-content><div class="md-actions" layout="row"><md-button ng-click="close()">Close</md-button></div></md-dialog>',
      parent: angular.element(document.body),
      clickOutsideToClose: true,
      classType: classType,
      spells: $scope.SPELLS[classType]
    });
  };
  
  $scope.showSkills = function(classType) {
    $mdDialog.show({
      controller: function($scope, $mdDialog, classType, skills) {
        $scope.classType = classType, $scope.skills = skills;
        $scope.close = function() { $mdDialog.hide(); };
      },
      template: '<md-dialog aria-label="docs-spells"><md-dialog-content>{{ classType | uppercase }} skills<md-divider></md-divider><md-list>' +
        '<md-list-item ng-repeat="skill in skills"><div hljs source="skill.example" language="javascript"></div></md-list-item>' +
        '</md-list></md-dialog-content><div class="md-actions" layout="row"><md-button ng-click="close()">Close</md-button></div></md-dialog>',
      parent: angular.element(document.body),
      clickOutsideToClose: true,
      classType: classType,
      skills: $scope.SKILLS[classType]
    });
  };
  
  $scope.$watch('methodsWindow.shown', function(shown) {
    if (shown && !$scope.methodsWindow.selected) {
      $scope.methodsWindow.selected = METHODS.orientation.inRange;
    }
  });
  
});