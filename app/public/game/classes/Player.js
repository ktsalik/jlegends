"use strict";

var Player = function() {
  
  this.update = function(values) {
    for (var key in values) {
      this[key] = values[key];
    }
  }
};