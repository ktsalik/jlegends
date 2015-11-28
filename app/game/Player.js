"use strict";
var shortid = require('shortid');
var Classes = require('./Classes');
var Perception = require('./Perception');
var BuffMechanics = require('./BuffMechanics');

var Player = function(args) {
  this.perception = new Perception();
  this.id = args.id || shortid.generate();
  this.name = args.name || null;
  this.race = args.race;
  this.position = args.position || { x: 1 };
  this.level = args.level || 1;
  this.experience = args.experience || 0;
  BuffMechanics.apply(this);
  Classes[args.type].call(this);
  if (args.build) {
    for (var prop in args.build) {
      this[prop] += args.build[prop];
    }
  }
  this.hp = args.hp || this.life;
  if (this.mana) {
    this.mp = this.mana;
  }
  
  this.addExperience = function(xp) {
    while (xp > 0) {
      var dingXp = Math.round(Math.pow(this.level, 2) * 33.33) - this.experience;
      if (xp >= dingXp) {
        this.level++;
        if (typeof this.onDing === 'function')
          this.onDing();
        xp -= dingXp;
        this.experience = 0;
      } else {
        this.experience += xp;
        xp = 0;
      }
    }
  };
  
  this.onDing = null;
};

module.exports = Player;