"use strict";

var Orientation = function(me) {
  var game = this;
  
  me.orientation = {};
  
  me.orientation.space = function(direction) {
    switch (direction) {
      case 'left':
        return me.position.x - 1;
      break;
      case 'right':
        return game.sectors - me.position.x;
      break;
      default:
        return null;
      break;
    }
  };
  
  me.orientation.distanceFrom = function(target) {
    if (typeof target.position !== 'undefined' && typeof target.position.x === 'number') {
      return target.position.x - me.position.x;
    } else {
      return null;
    }
  };
  
  me.orientation.inRange = function(target) {
    if (typeof target.position !== 'undefined' && typeof target.position.x === 'number') {
      return Math.abs(me.orientation.distanceFrom(target)) <= me.range;
    } else {
      return null;
    }
  }
  
};

module.exports = Orientation;