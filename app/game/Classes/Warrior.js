"use strict";

var Stats = require('./Stats');

var Warrior = function() {
  this.type = 'warrior';
  
  this.strength = 10;
  this.agility = 10;
  this.vitality = 10;
  this.energy = 10;
  
  Stats.apply(this);
  
  this.rage = 0; // %
  this.range = 1;
  
  this.spells = [];
  this.skills = ['righteous-fury'];
  
  this.perception.on('hit', function() {
    var extraRage = 5;
    if (this.rage + extraRage > 100) extraRage = 100 - this.rage;
    this.rage += extraRage;
    return [
      {
        character: this.id,
        type: 'property.change',
        property: 'rage',
        value: extraRage
      }
    ];
  }.bind(this));
  
  this.perception.on('damaged', function() {
    var extraRage = 10;
    if (this.rage + extraRage > 100) extraRage = 100 - this.rage;
    this.rage += extraRage;
    return [
      {
        character: this.id,
        type: 'property.change',
        property: 'rage',
        value: extraRage
      }
    ];
  }.bind(this));
  
};

module.exports = Warrior;