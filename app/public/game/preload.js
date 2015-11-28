"use strict";
/**
 * PRELOAD method used in Phaser.Game
 */
Canvas.prototype.preload = function(game) {
  var canvas = this;
  return function() {
    this.load.image('landscape', 'assets/graphics/landscape.png');
    this.load.atlasJSONArray('human.warrior', 'assets/graphics/human.warrior.png', 'assets/graphics/sprite-map.json');
    this.load.atlasJSONArray('human.warrior.boost', 'assets/graphics/human.warrior.boost.png', 'assets/graphics/sprite-map.json');
    this.load.atlasJSONArray('human.ranger', 'assets/graphics/human.ranger.png', 'assets/graphics/sprite-map.json');
    this.load.atlasJSONArray('human.priest', 'assets/graphics/human.priest.png', 'assets/graphics/sprite-map.json');
    this.load.atlasJSONArray('human.mage', 'assets/graphics/human.mage.png', 'assets/graphics/sprite-map.json');
    this.load.atlasJSONArray('orc.warrior', 'assets/graphics/orc.warrior.png', 'assets/graphics/sprite-map.json');
    this.load.atlasJSONArray('undead.ranger', 'assets/graphics/undead.ranger.png', 'assets/graphics/sprite-map.json');
    
    this.load.image('arrow', 'assets/graphics/arrow.png');
    
    this.load.spritesheet('spell.crystal-spike', 'assets/graphics/spell.crystal-spike.png', 170, 170);
    this.load.spritesheet('spell.heal', 'assets/graphics/spell.heal.png', 192, 192);
    this.load.spritesheet('spell.unstable-power', 'assets/graphics/spell.unstable-power.png', 192, 192);
    this.load.spritesheet('spell.ignite', 'assets/graphics/spell.ignite.png', 192, 192);
    this.load.spritesheet('spell.mana-shield', 'assets/graphics/spell.mana-shield.png', 192, 192);
    this.load.spritesheet('buff.mana-shield', 'assets/graphics/buff.mana-shield.png', 192, 192);
    this.load.spritesheet('buff.righteous-fury', 'assets/graphics/buff.righteous-fury.png', 192, 192);
    this.load.spritesheet('skill.ruthless-shot', 'assets/graphics/skill.ruthless-shot.png', 80, 42);
    this.load.spritesheet('skill.righteous-fury', 'assets/graphics/skill.righteous-fury.png', 192, 192);
    this.load.spritesheet('effect.ruthless-shot', 'assets/graphics/effect.ruthless-shot.png', 192, 192);
    
    this.load.onLoadStart.add(function() {
      canvas.loadingText = this.add.text(32, 32, 'Loading...', { fill: '#FFC107' });
    }, this);
    
    this.load.onLoadComplete.add(function() {
      this.world.remove(canvas.loadingText);
      canvas.loadingText = null;
      canvas.ready = true;
    }, this);
    
    this.load.start();
  };
};