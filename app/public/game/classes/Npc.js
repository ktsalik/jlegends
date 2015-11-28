"use strict";

var Npc = function() {
  
  this.update = function(values) {
    for (var key in values) {
      this[key] = values[key];
    }
  }
};