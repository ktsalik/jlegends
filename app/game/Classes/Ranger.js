"use strict";

var Stats = require('./Stats.js');

var Ranger = function() {
  this.type = 'ranger';
  
  this.strength = 10;
  this.agility = 10;
  this.vitality = 10;
  this.energy = 10;
  
  Stats.apply(this);
  
  this.range = 4;
  
  this.spells = [];
  this.skills = ['ruthless-shot'];
};

module.exports = Ranger;