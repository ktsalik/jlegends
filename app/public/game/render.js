"use strict";
/**
 * RENDER method used in Phaser.Game
 */
Canvas.prototype.render = function(game) {
  var canvas = this;
  return function() {
    canvas.players.forEach(function(player) {
      var gameInstance = game.players.getBy('id', player.id);
      if (gameInstance) {
        player.nameText.text = (gameInstance.name || "").substr(0, 10);
          
      }
      player.nameText.position.x = player.sprite.body.center.x - (player.nameText.width / 2);
      player.nameText.position.y = player.sprite.body.y - (player.sprite.body.height * 0.35);
    });
    
    canvas.fpsText.setText("fps: " + canvas.game.time.fps);
    if (typeof latency !== 'undefined') {
      canvas.latencyText.setText("latency: " + latency);
      var latencyColor = latency < 333 ? '#33CC33' : '#FF0000';
      canvas.latencyText.setStyle({ font: "10px source-code", fill: latencyColor, align: "center" });
    }
  };
};