"use strict";

module.exports = {
  'crystal-spike': function(caster, target, afterEffects) {
    if (target && typeof target.hp === 'number') {
      var manaRequired = 40 + (caster.level * 3.33);
      if (target.hp > 0 && caster.mp >= manaRequired) {
        var damage = caster.ap;
        if (target.hp - damage < 0) {
          damage = target.hp;
        }
        target.hp -= damage;
        caster.mp -= manaRequired;
        
        if (!Array.isArray(afterEffects)) afterEffects = [];
        afterEffects.push({
          character: caster.id,
          type: 'property.change',
          property: 'mp',
          value: -manaRequired
        });
        
        return damage;
      } else {
        return false;
      }
    } else {
      return null;
    }
  },
  'heal': function(caster, target, afterEffects) {
    if (target && typeof target.hp === 'number') {
      var manaRequired = 15 + (caster.level * 3.33);
      if (target.hp > 0 && caster.mp >= manaRequired) {
        var damage = 0;
        var heal = caster.ap;
        if (target.hp + heal > target.life) heal = target.life - target.hp;
        target.hp += heal;
        caster.mp -= manaRequired;
        if (!Array.isArray(afterEffects)) afterEffects = [];
        afterEffects.push({
          character: target.id,
          type: 'heal',
          value: heal,
        });
        afterEffects.push({
          character: caster.id,
          type: 'property.change',
          property: 'mp',
          value: -manaRequired
        });
        return damage;
      } else {
        return false;
      }
    } else {
      return null;
    }
  },
  'unstable-power': function(caster, target, afterEffects) {
    if (target && typeof target.hp === 'number') {
      var manaRequired = 15 + (caster.level * 3.33);
      if (target.hp > 0 && caster.mp >= manaRequired) {
        var damage = caster.ap;
        if (target.hp - damage < 0) {
          damage = target.hp;
        }
        target.hp -= damage;
        caster.mp -= manaRequired;
        
        if (!Array.isArray(afterEffects)) afterEffects = [];
        afterEffects.push({
          character: caster.id,
          type: 'property.change',
          property: 'mp',
          value: -manaRequired
        });
        
        return damage;
      } else {
        return false;
      }
    } else {
      return null;
    }
  },
  'ignite': function(caster, target, afterEffects) {
    if (target && typeof target.hp === 'number') {
      var manaRequired = 40 + (caster.level * 3.33);
      if (target.hp > 0 && caster.mp >= manaRequired) {
        var damage = caster.ap;
        if (target.hp - damage < 0) {
          damage = target.hp;
        }
        target.hp -= damage;
        caster.mp -= manaRequired;
        
        if (!Array.isArray(afterEffects)) afterEffects = [];
        afterEffects.push({
          character: caster.id,
          type: 'property.change',
          property: 'mp',
          value: -manaRequired
        });
        
        return damage;
      } else {
        return false;
      }
    } else {
      return null;
    }
  },
  'mana-shield': function(caster, target, afterEffects) {
    if (target && typeof target.hp === 'number') {
      var manaRequired = 30 + (caster.level * 3.33);
      if (caster.mp >= manaRequired) {
        caster.mp -= manaRequired;
        var damage = 0;
        target.buffs.apply('mana-shield', 5);
        if (!Array.isArray(afterEffects)) afterEffects = [];
        afterEffects.push({
          character: caster.id,
          type: 'property.change',
          property: 'mp',
          value: -manaRequired
        });
        afterEffects.push({
          character: target.id,
          type: 'buff',
          buff: 'mana-shield'
        });
        return damage;
      } else {
        return false;
      }
    } else {
      return null;
    }
  }
};