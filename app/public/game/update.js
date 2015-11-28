"use strict";
/**
 * UPDATE method used in Phaser.Game
 */
Canvas.prototype.update = function() {
  var canvas = this;
  return function() {
    canvas.players.forEach(function(player) {
      if (player.hp > 0) {
        if (!player.sprite.inWorld) {
          player.sprite.body.y = canvas.ground.sprite.y - (player.sprite.height * 2);
          player.sprite.play('stand.right');
        } else {
          this.physics.arcade.collide(player.sprite, canvas.ground.sprite);    
        }
      } else {
        this.physics.arcade.collide(player.sprite, canvas.hades.sprite);
      }
    }.bind(this));
    
    canvas.npcs.forEach(function(npc) {
      if (npc.hp > 0) {
        this.physics.arcade.collide(npc.sprite, canvas.ground.sprite);  
      }
      npc.levelText.x = npc.sprite.x + npc.sprite.width * 0.2 - npc.levelText.width;
      npc.levelText.y = npc.sprite.y;
    }.bind(this));
    
    canvas.draw.lifebars();
    canvas.draw.manabars();
    canvas.draw.ragebars();
    canvas.draw.buffs();
    canvas.draw.experience();
  };
};