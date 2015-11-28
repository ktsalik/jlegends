"use strict";

var directives = angular.module('directives', []);

directives.directive('codeEditor', function($http) {
  return {
    restrict: 'E',
    replace: true,
    template: '<textarea></textarea>',
    link: function(scope, element, attrs) {
      element.css({
        height: window.innerHeight - $('#canvas').height()
      });
      editor = CodeMirror.fromTextArea(element[0], {
        mode: 'javascript',
        lineNumbers: true,
        theme: 'material',
        'font-family': 'source-code',
        tabSize: 2,
        extraKeys: {
          "Cmd-S": scope.saveCode,
          "Ctrl-S": scope.saveCode
        }
      });
      editor.on('focus', function() { for (var i = 0; i < editor.lineCount(); i++) editor.removeLineClass(i, 'background', 'line-error'); });
      $http.get('/code?character=' + scope.character.id).then(function(res) {
        if (res.data) editor.setValue(res.data);
        else editor.setValue('/*\n * Write your code here\n * example:\n\nvar enemy = getEnemy();\nmoveTo(enemy);\nattack(enemy);\n\n*/');
      });
    }
  };
});

directives.directive('ngEnter', function() {
  return function(scope, element, attrs) {
    element.bind('keydown keypress', function(event) {
      if (event.which == 13) {
        scope.$apply(function() {
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  };
});

directives.directive('mouseDraggable', function() {
  return {
    restrict: 'A',
    scope: {},
    link: function(scope, element, attrs) {
      scope.dragElement = attrs.dragsParent ? element.parent() : element;
      scope.mouse = { x: 0, y: 0 };
      scope.elPosition = { x: 0, y: 0 };
      scope.drag = false;
      element.css('cursor', 'move');
      function moveElement(e) {
        scope.mouse.x = document.all ? window.event.clientX : e.pageX;
        scope.mouse.y = document.all ? window.event.clientY : e.pageY;
        var newX = scope.mouse.x - scope.elPosition.x;
        var newY = scope.mouse.y - scope.elPosition.y;
        if (newX + scope.dragElement.width() < document.body.offsetWidth && newX > 0)
          scope.dragElement[0].style.left = newX + 'px';
        if (newY + scope.dragElement.height() < document.body.offsetHeight && newY > 0)
          scope.dragElement[0].style.top = newY + 'px';
      }
      element[0].onmousedown = function (e) {
        scope.elPosition.x = e.clientX - scope.dragElement[0].offsetLeft;
        scope.elPosition.y = e.clientY - scope.dragElement[0].offsetTop;
        scope.drag = true;
      };
      
      element[0].onmouseup = function () {
        scope.drag = false;
      };
      
      document.onselectstart = function() { return !scope.drag; }
      
      $(document).mousemove(function(e) {
        if (scope.drag) {
          moveElement(e);
        }
      });
    }
  };
});
