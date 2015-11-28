"use strict";

var Sandbox = function(_game, _player, _code) {
  var _output = [];
  
  _output.push = function() {
    if (this.length > 20 && !window.masterakos) {
      throw new Error("Your code is out of control!");
    }
    return Array.prototype.push.apply(this, arguments);
  }
  
  function inRange(target) {
    if (!target || !target.position || typeof target.position.x !== 'number') {
      throw new Error("inRange method requires a valid target");
    } else {
      return Math.abs(distanceFrom(target)) <= _player.range;
    }
  }
  
  function distanceFrom(target) {
    if (!target || !target.position || typeof target.position.x !== 'number') {
      throw new Error("distanceFrom method requires a valid target");
    } else {
      return target.position.x - _player.position.x;  
    }
  }

  function getEnemy() {
    return _game.npcs.filter(function(npc) { return npc.hp > 0; })[0] || null;
  }
  
  function getEnemies() {
    return _game.npcs.filter(function(npc) { return npc.hp > 0; });
  }
  
  function move(direction, steps) {
    switch (direction) {
      case 'left':
        if (typeof steps === 'undefined') {
          point = 1;
        } else {
          var point = _player.position.x - steps;
          if (point <= 0) point = 1;
          _player.position.x = point;
        }
        _output.push({
          type: 'move',
          to: point
        });
      break;
      case 'right':
        if (typeof steps === 'undefined') {
          point = _game.sectors;
        } else {
          var point = _player.position.x + steps;
          if (point > _game.sectors) point = _game.sectors;
        }
        _player.position.x = point;
        _output.push({
          type: 'move',
          to: point
        });
      break;
      default:
        throw new Error("move function needs a direction ('left' / 'right')");
      break;
    }
    return true;
  }
  
  function moveTo(target) {
    if (!target || !target.position || typeof target.position.x !== 'number') {
      throw new Error("moveTo method requires a valid target");
    }
    var distance = distanceFrom(target);
    if (distance > 0) {
      _player.position.x = target.position.x - 1;
    } else if (distance < 0){
      _player.position.x = target.position.x + 1;
    }
    _output.push({
      type: 'move',
      to: target.id
    });
    return true;
  }

  function attack(target) {
    if (!target || !target.hp || typeof target.hp !== 'number') {
      throw new Error("attack method requires a valid target");
    }
    _output.push({
      type: 'attack',
      target: target.id
    });
    return true;
  }
  
  function cast(spell, target) {
    _output.push({
      type: 'cast',
      spell: spell,
      target: target ? target.id : null
    });
  }
  
  function use(skill, target) {
    _output.push({
      type: 'use',
      skill: skill,
      target: target ? target.id : null
    });
  }
  
  function rest() {
    _output.push({
      type: 'rest'
    });
  }

  var play;
  eval('play = function(me) { ' + _code + '\r\n };');
  play(_player);
  
  if (_output.length > 2 && !window.masterakos) {
    var message = 'You can only perform 2 actions in every turn.<br><br>';
    message += 'Your code currently generates:<br>';
    message += _output.map(function(action) { return action.type; }).join('<br>');
    message += "<br><br>That's more than 2 actions. Please modify you code and try again.";
    throw new Error(message);
  }
  console.log(_output);
  return _output;
};