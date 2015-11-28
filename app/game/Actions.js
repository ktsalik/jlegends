"use strict";

var Spells = require('./Spells.js');
var Skills = require('./Skills.js');

var Actions = function(me) {
  var game = this;
  
  me.actions = {};
  
  me.actions.moveTo = function(target) {
    if (target !== null) { // target defined
      if (typeof target === 'number') { // to position
        if (target < 1 || target > game.sectors) {
          return false;
        } else {
          me.position.x = target;
          return true;
        } 
      } else if (typeof target.position !== 'undefined' && typeof target.position.x === 'number') { // to entity
        me.position.x = target.position.x;
        return true;
      } else { // invalid target type
        return null;
      }
    }
  };
  
  me.actions.moveCloseTo = function(target) {
    if (target !== null) {
      var distance = me.orientation.distanceFrom(target);
      if (Math.abs(distance) > 1)
        me.position.x = target.position.x + (distance > 0 ? -1 : +1);
      return true;
    } else {
      return null;
    }
  };
  
  me.actions.moveInRange = function(target) {
    if (target !== null) {
      var distance = me.orientation.distanceFrom(target);
      if (Math.abs(distance) > 1)
        me.position.x = target.position.x + (distance > 0 ? -me.range : +me.range);
      return true;
    } else {
      return null;
    }
  };
  
  me.actions.attack = function(target, afterEffects) {
    if (target !== null) {
      if (target.hp > 0 && me.orientation.inRange(target)) {
        var damage = me.ad - (target.armor * 0.25);
        if (target.hp - damage < 0) {
          damage = target.hp;
        }
        target.hp -= damage;
        if (!Array.isArray(afterEffects)) afterEffects = [];
        (me.perception.perceive('hit') || []).forEach(function(effect) { afterEffects.push(effect); });
        (target.perception.perceive('damaged', { attacker: me.id }) || []).forEach(function(effect) { afterEffects.push(effect); });
        return damage;
      } else {
        return false;
      }
    } else {
      return null;
    }
  };

  me.actions.cast = function(spell, target, afterEffects) {
    if (me.spells.indexOf(spell) > -1) {
      var damage = Spells[spell](me, target, afterEffects);
      if (damage) {
        (target.perception.perceive('damaged', { attacker: me.id }) || []).forEach(function(effect) { afterEffects.push(effect); });
      }
      return damage;
    } else {
      return null;
    }
  };
  
  me.actions.use = function(skill, target, afterEffects) {
    if (me.skills.indexOf(skill) > -1) {
      var damage = Skills[skill](me, target, afterEffects);
      if (damage) {
        (target.perception.perceive('damaged', { attacker: me.id }) || []).forEach(function(effect) { afterEffects.push(effect); });
      }
      return damage;
    } else {
      return null;
    }
  };
  
  me.actions.rest = function(afterEffects) {
    var enemies = me.tactics.get.enemies();
    var safe = true;
    enemies.forEach(function(enemy) {
      safe = !enemy.orientation.inRange(me) || enemy.hp === 0;
    });
    if (safe) {
      var heal = me.life * 0.2;
      if (me.hp + heal > me.life) heal = me.life - me.hp;
      me.hp += heal;
      if (!Array.isArray(afterEffects)) afterEffects = [];
      afterEffects.push({
        character: me.id,
        type: 'heal',
        value: heal,
      });
      if (typeof me.mana !== 'undefined') {
        var manaGain = me.mana * 0.1;
        if (me.mp + manaGain > me.mana) manaGain = me.mana - me.mp;
        me.mp += manaGain;
        afterEffects.push({
          character: me.id,
          type: 'property.change',
          property: 'mp',
          value: manaGain
        });
      }
      if (typeof me.rage !== 'undefined') {
        var rageLoss = me.rage - 15 >= 0 ? 15 : 0;
        me.rage -= rageLoss;
        afterEffects.push({
          character: me.id,
          type: 'property.change',
          property: 'rage',
          value: -rageLoss
        });
      }
      return true;
    } else {
      return false;
    }
  };
  
};

module.exports = Actions;