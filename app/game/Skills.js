"use strict";

module.exports = {
  'ruthless-shot': function(actor, target, afterEffects) {
    if (target && typeof target.hp === 'number') {
      var manaRequired = 40 + (actor.level * 3.33);
      if (target.hp > 0 && actor.mp >= manaRequired) {
        var damage = actor.ad + actor.ap;
        if (target.hp - damage < 0) {
          damage = target.hp;
        }
        target.hp -= damage;
        actor.mp -= manaRequired;
        
        if (!Array.isArray(afterEffects)) afterEffects = [];
        afterEffects.push({
          character: actor.id,
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
  'righteous-fury': function(actor, target, afterEffects) {
    var rageRequired = 100;
    if (actor.rage == rageRequired) {
      var damage = 0;
      actor.rage -= rageRequired;
      actor.buffs.apply('righteous-fury', 7);
      if (!Array.isArray(afterEffects)) afterEffects = [];
      afterEffects.push({
        character: actor.id,
        type: 'property.change',
        property: 'rage',
        value: -rageRequired
      });
      afterEffects.push({
        character: actor.id,
        type: 'buff',
        buff: 'righteous-fury'
      });
    } else {
      return false;
    }
    return damage;
  }
};