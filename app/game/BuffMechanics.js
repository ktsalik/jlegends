"use strict";

var BuffMechanics = function() {
  this.buffs = [];
  
  this.buffs.stats = {
    ad: 0.0,
    ap: 0.0,
    armor: 0.0,
    life: 0.0,
    mana: 0.0
  };
  
  this.buffs.apply = function(name, duration) {
    if (this.getBy('name', name) === null) {
      switch (name) {
        case 'mana-shield':
          this.stats.armor += 1.0;
        break;
        case 'righteous-fury':
          this.stats.ad += 0.5;
          this.stats.armor += 1.0;
        break;
      }
      this.push({
        name: name,
        duration: duration
      });
    } else {
      this.updateWhere('name', name, 'duration', duration);
    }
  };
  
  this.buffs.tick = function() {
    for (var i = 0; i < this.length; i++) {
      if (--this[i].duration === 0) {
        switch (this[i].name) {
          case 'mana-shield':
            this.stats.armor -= 1.0;
          break;
          case 'righteous-fury':
            this.stats.ad -= 0.5;
            this.stats.armor -= 1.0;
          break;
        }
        this.splice(i--, 1);
      }
    }
  };
  
};

module.exports = BuffMechanics;