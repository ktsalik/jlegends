"use strict";

var Stats = require('./Stats');

var Mage = function() {
  this.type = 'mage';
  
  this.strength = 10;
  this.agility = 10;
  this.vitality = 10;
  this.energy = 10;
  
  Stats.apply(this);
  
  this.range = 1;
  
  this.spells = ['unstable-power', 'ignite', 'mana-shield'];
  this.skills = [];
};

module.exports = Mage;