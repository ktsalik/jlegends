"use strict";
var shortid = require('shortid');
var Classes = require('./Classes');
var Perception = require('./Perception');
var BuffMechanics = require('./BuffMechanics');

var Npc = function(options) {
  this.perception = new Perception();
  this.id = shortid.generate();
  this.name = options.name || null;
  this.race = options.race;
  this.position = options.position || { x: 1 };
  this.startPoint = this.position.x;
  this.level = options.level || 1;
  BuffMechanics.apply(this);
  Classes[options.type].call(this);
  ['strength', 'agility', 'vitality', 'energy'].forEach(function(prop) {
    this[prop] = 7 + this.level;
  }.bind(this));
  this.hp = options.hp || this.life;
  if (this.mana) { this.mp = this.mana; }
  
  switch (this.type) {
    case 'warrior':
      this.patrolRange = 3;
      this.agroRange = this.range + 1;
      this.resetAgroRange = this.range + 2;
    break;
    case 'ranger':
      this.patrolRange = 2;
      this.agroRange = this.range + 1;
      this.resetAgroRange = this.range + 2;
    break;
  }
  
  this.agro = [];
  this.perception.on('damaged', function(args) {
    var exists = false;
    for (var i = 0; i < this.agro.length; i++) {
      if (this.agro[i].character == args.attacker) {
        exists = true;
        break;
      }
    }
    if (!exists) this.agro.push({ character: args.attacker, value: 100 });
    return [
      {
        character: this.id,
        type: 'agro.on',
        who: args.attacker
      }
    ];
  }.bind(this));
};

module.exports = Npc;