"use strict";

var Stats = function() {
  
  var ad, ap, armor, life, mana;
  
  switch (this.type) {
    case 'warrior':
      ad = function() { return this.strength * 1.5; }.bind(this);
      ap = function() { return this.energy * 0; }.bind(this);
      armor = function() { return (this.strength * 0.25) + (this.agility * 0.75); }.bind(this);
      life = function() { return this.vitality * 10; }.bind(this);
    break;
    case 'ranger':
      ad = function() { return this.agility * 1.5 + this.strength * 0.25; }.bind(this);
      ap = function() { return this.energy * 1.5; }.bind(this);
      armor = function() { return (this.strength * 0.25) + (this.agility * 0.25); }.bind(this);
      life = function() { return this.vitality * 7.5; }.bind(this);
      mana = function() { return 100 + (this.energy * 1.5); }.bind(this);
    break;
    case 'priest':
      ad = function() { return this.strength * 0.75; }.bind(this);
      ap = function() { return this.energy * 2; }.bind(this);
      armor = function() { return (this.strength * 0.25) + (this.agility * 0.25); }.bind(this);
      life = function() { return this.vitality * 5; }.bind(this);
      mana = function() { return 100 + (this.energy * 4); }.bind(this);
    break;
    case 'mage':
      ad = function() { return this.strength * 0.75; }.bind(this);
      ap = function() { return this.energy * 3; }.bind(this);
      armor = function() { return (this.strength * 0.25) + (this.agility * 0.25); }.bind(this);
      life = function() { return this.vitality * 5; }.bind(this);
      mana = function() { return 100 + (this.energy * 3); }.bind(this);
    break;
  };
  
  Object.defineProperty(this, 'ad', {
    enumerable: true,
    get: function() {
      var totalAd = ad(); // base ad
      if (typeof this.rage !== 'undefined') {
        totalAd += ad() * (this.rage / 1000)
      }
      totalAd += ad() * this.buffs.stats.ad; // buffs
      return totalAd;
    }
  });
  
  Object.defineProperty(this, 'ap', {
    enumerable: true,
    get: function() {
      return ap() + (ap() * this.buffs.stats.ap);
    }
  });

  Object.defineProperty(this, 'armor', {
    enumerable: true,
    get: function() {
      return armor() + (armor() * this.buffs.stats.armor);
    }
  });
  
  Object.defineProperty(this, 'life', {
    enumerable: true,
    get: function() {
      return life() + (life() * this.buffs.stats.life);
    }
  });
  
  Object.defineProperty(this, 'mana', {
    enumerable: true,
    get: function() {
      if (typeof mana === 'function')
        return mana() + (mana() * this.buffs.stats.mana);
    }
  });
  
};

module.exports = Stats;