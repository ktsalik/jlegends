"use strict";

var Perception = function() {
  
  this.reactions = [];
  
  this.on = function(event, action) {
    this.reactions.push({
      event: event,
      action: action
    });
  };
  
  this.off = function(event) {
    for (var i = 0; i < this.reactions.length; i++) {
      if (this.reactions[i].event == event)
        this.reactions.splice(i--, 1);
    }
  };
  
  this.perceive = function(event, args) {
    var afterEffects = [];
    for (var reaction of this.reactions) {
      if (reaction.event == event) {
        var effects = reaction.action(args);
        afterEffects = afterEffects.concat(effects);
      }
    }
    return afterEffects;
  };

};

module.exports = Perception;