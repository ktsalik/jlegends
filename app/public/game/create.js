"use strict";
/**
 * CREATE method used in Phaser.Game
 */
Canvas.prototype.create = function(game) {
  var canvas = this;
  return function() {
    this.time.advancedTiming = true;
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.stage.disableVisibilityChange = true;
    this.physics.startSystem(Phaser.Physics.ARCADE);
    
    canvas.landscape = this.add.tileSprite(0, 0, canvas.width, canvas.height, 'landscape');
    canvas.landscape.alpha = 0.8
    canvas.landscape.tileScale.setTo(
      canvas.width / this.cache.getImage('landscape').width,
      canvas.height / this.cache.getImage('landscape').height
    );
    
    var sprite = this.add.sprite(0, this.world.height * 0.99);
    this.physics.arcade.enableBody(sprite);
    sprite.body.width = this.world.width;
    sprite.body.allowGravity = false;
    sprite.body.immovable = true;
    canvas.ground.sprite = sprite;
    
    var sprite = this.add.sprite(0, this.world.height * 2);
    this.physics.arcade.enableBody(sprite);
    sprite.body.width = this.world.width;
    sprite.body.allowGravity = false;
    sprite.body.immovable = true;
    canvas.hades.sprite = sprite;
    
    /**
     * npcs
     */
    game.npcs.forEach(function(npc) {
      canvas.spawn.npc(npc);
    });
    
    /**
     * players
     */
    game.players.forEach(function(player) {
      canvas.spawn.player(player);
    });
    
    canvas.fpsText = this.add.text(this.world.width - 100, 10, "", { font: "10px source-code", fill: "#FFC107", align: "center" });
    canvas.latencyText = this.add.text(this.world.width - 100, 25, "", { font: "10px source-code", fill: "#FFF", align: "center" });
    
    this.input.keyboard.onDownCallback = function(e) {
      
    };
  };
};