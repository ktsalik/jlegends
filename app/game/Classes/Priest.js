"use strict";

var Stats = require('./Stats');

var Priest = function() {
  this.type = 'priest';
  
  this.strength = 10;
  this.agility = 10;
  this.vitality = 10;
  this.energy = 10;
  
  Stats.apply(this);
  
  this.range = 1;
  
  this.spells = ['crystal-spike', 'heal'];
  this.skills = [];
};

module.exports = Priest;