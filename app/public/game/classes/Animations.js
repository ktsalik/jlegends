"use strict";

var Animation = function(name, firstFrame, lastFrame, repeat) {
  this.name = name;
  this.frames = { first: firstFrame, last: lastFrame };
  this.speed = (lastFrame - firstFrame) * 2;
  this.repeat = repeat !== 'undefined' ? repeat : false;
  this.duration = ((lastFrame - firstFrame) * 1000) / this.speed;
};

var Animations = {
  'walk.left': new Animation('walk.left', 70, 78, true),
  'walk.right': new Animation('walk.right', 88, 96, true),
  'thrust.left': new Animation('thrust.left', 37, 44),
  'thrust.right': new Animation('thrust.right', 53, 60),
  'slash.left': new Animation('slash.left', 103, 108),
  'slash.right': new Animation('slash.right', 115, 120),
  'shoot.left': new Animation('shoot.left', 134, 146),
  'shoot.right': new Animation('shoot.right', 160, 172),
  'cast.left': new Animation('cast.left', 8, 14),
  'cast.right': new Animation('cast.right', 22, 28),
  'death': new Animation('death', 173, 178),
  'rest': new Animation('rest', 175, 175),
  'stand.left': new Animation('stand.left', 70, 70),
  'stand.right': new Animation('stand.right', 88, 88)
};

Animations.grant = function(race, type) {
  this.animations = [];

  switch (race) {
    case 'human':
    case 'orc':
    case 'undead':
      this.animations.push(Animations['stand.left']);
      this.animations.push(Animations['stand.right']);
      this.animations.push(Animations['walk.left']);
      this.animations.push(Animations['walk.right']);
      this.animations.push(Animations['cast.left']);
      this.animations.push(Animations['cast.right']);
      this.animations.push(Animations['rest']);
      this.animations.push(Animations['death']);
    break;
  }
  
  switch (type) {
    case 'warrior':
      if (race == 'human') {
        this.animations.push(Animations['thrust.left']);
        this.animations.push(Animations['thrust.right']);
        this.animations.attack = 'thrust';
      } else if (race == 'orc') {
        this.animations.push(Animations['slash.left']);
        this.animations.push(Animations['slash.right']);
        this.animations.attack = 'slash';
      }
    break;
    case 'ranger':
      this.animations.push(Animations['shoot.left']);
      this.animations.push(Animations['shoot.right']);
      this.animations.attack = 'shoot';
    break;
    case 'priest':
      this.animations.push(Animations['slash.left']);
      this.animations.push(Animations['slash.right']);
      this.animations.attack = 'slash';
    break;
    case 'mage':
      this.animations.push(Animations['slash.left']);
      this.animations.push(Animations['slash.right']);
      this.animations.attack = 'slash';
    break;
  }
  
  this.generateTween = function(canvas, type, params, onStart, onComplete) {
    var game = canvas.game;
    var tween;
    var actor = this;
    switch (type) {
      case 'move':
        tween = game.add.tween(actor.sprite).to({ x: params.point });
        tween.onStart.addOnce(function(sprite) {
          var distance = params.point - sprite.body.x;
          if (distance !== 0) {
            var direction = distance > 0 ? 'right' : 'left';
            tween.updateTweenData('duration', (Math.abs(distance) / canvas.stageStep) * 400);
            sprite.play('walk.' + direction);
          } else {
            tween.updateTweenData('duration', 1);
          }
          if (typeof onStart === 'function') onStart(sprite);
        });
        tween.onComplete.addOnce(function(sprite) {
          sprite.animations.stop();
          var facingNow = sprite.animations.currentAnim.name.split('.')[1];
          sprite.play('stand.' + facingNow);
          if (typeof onComplete === 'function') onComplete(sprite);
        });
      break;
      case 'attack':
        var target = params.target;
        tween = game.add.tween(actor.sprite).to({}, actor.animations.getBy('name', actor.animations.attack + '.left').duration);
        if (actor.animations.attack == 'shoot') {
          tween.onComplete.addOnce(function(sprite) {
            var direction = target.sprite.body.x < sprite.body.x ? 'left' : 'right';
            var arrowStartPoint = sprite.body.x;
            if (direction == 'right') arrowStartPoint += sprite.body.width;
            var arrow = game.add.sprite(arrowStartPoint, sprite.body.center.y, 'arrow');
            arrow.anchor.setTo(0.5, 0.5);
            arrow.angle = direction == 'left' ? 45 + 180 : 45;
            var travelDistance = Math.abs(arrowStartPoint - target.sprite.body.center.x);
            var arrowTween = game.add.tween(arrow).to({ x: target.sprite.body.center.x }, travelDistance);
            arrowTween.onComplete.addOnce(function(arrow) { arrow.destroy(); });
            arrowTween.start();
          });
        }
        tween.onStart.addOnce(function(sprite) {
          var direction = target.sprite.body.x < sprite.body.x ? 'left' : 'right';
          sprite.play(actor.animations.attack + '.' + direction);
          if (typeof onStart === 'function') onStart(sprite);
        });
        tween.onComplete.addOnce(function(sprite) {
          sprite.animations.stop();
          var facingNow = sprite.animations.currentAnim.name.split('.')[1];
          sprite.play('stand.' + facingNow);
          if (typeof onComplete === 'function') onComplete(sprite);
        });
      break;
      case 'cast':
        var target = params.target;
        tween = game.add.tween(actor.sprite).to({}, actor.animations.getBy('name', 'cast.left').duration);
        tween.onStart.addOnce(function(sprite) {
          var direction = target.sprite.body.x < sprite.body.x ? 'left' : 'right';
          sprite.play('cast.' + direction);
          if (typeof onStart === 'function') onStart(sprite);
        });
        tween.onComplete.addOnce(function(sprite) {
          sprite.animations.stop();
          var facingNow = sprite.animations.currentAnim.name.split('.')[1];
          sprite.play('stand.' + facingNow);
          
          var spell = target.sprite.addChild(game.make.sprite(target.sprite.body.width / 2, target.sprite.body.height / 2, 'spell.' + params.spell));
          spell.anchor.setTo(0.5, 0.5);
          spell.animations.add('animation').play(game.cache.getFrameCount('spell.' + params.spell), false, true);
          
          if (typeof onComplete === 'function') onComplete(sprite);
        });
      break;
      case 'use':
        switch (params.skill) {
          case 'ruthless-shot':
            var target = params.target;
            tween = game.add.tween(actor.sprite).to({}, actor.animations.getBy('name', 'shoot.left').duration);
            tween.onStart.addOnce(function(sprite) {
              var direction = target.sprite.body.x < sprite.body.x ? 'left' : 'right';
              sprite.play('shoot.' + direction);
              if (typeof onStart === 'function') onStart(sprite);
            });
            tween.onComplete.addOnce(function(sprite) {
              sprite.animations.stop();
              var facingNow = sprite.animations.currentAnim.name.split('.')[1];
              sprite.play('stand.' + facingNow);
              
              var arrowStartPoint = sprite.body.x;
              if (facingNow == 'right') arrowStartPoint += sprite.body.width;
              var arrow = game.add.sprite(arrowStartPoint, sprite.body.center.y, 'skill.ruthless-shot');
              arrow.anchor.setTo(0.5, 0.5);
              arrow.angle = facingNow == 'left' ? 0 : 180;
              var travelDistance = Math.abs(arrowStartPoint - target.sprite.body.center.x);
              var arrowTween = game.add.tween(arrow).to({ x: target.sprite.body.center.x }, travelDistance / 5);
              arrowTween.onComplete.addOnce(function(arrow) { 
                arrow.destroy(); 
                var hitEffect = target.sprite.addChild(game.make.sprite(target.sprite.body.width / 2, target.sprite.body.height / 2, 'effect.ruthless-shot'));
                hitEffect.width = target.sprite.width * 1.5;
                hitEffect.height = target.sprite.height * 1.5;
                hitEffect.anchor.setTo(0.5, 0.5);
                hitEffect.animations.add('animation').play(game.cache.getFrameCount('effect.ruthless-shot'), false, true);
              });
              arrowTween.start();
              
              if (typeof onComplete === 'function') onComplete(sprite);
            });
          break;
          case 'righteous-fury':
            var effect = actor.sprite.addChild(game.make.sprite(actor.sprite.body.width / 2, actor.sprite.body.height / 2, 'skill.righteous-fury'));
            effect.anchor.setTo(0.5, 0.5);
            effect.animations.add('animation');
            tween = game.add.tween(actor.sprite).to({}, 650);
            tween.onStart.addOnce(function(sprite) {
              effect.play('animation', game.cache.getFrameCount('skill.righteous-fury'), false, true);
              if (typeof onStart === 'function') onStart(sprite);
            });
            tween.onComplete.addOnce(function(sprite) {
              var facingNow = actor.sprite.animations.currentAnim.name.split('.')[1];
              actor.sprite.loadTexture('human.warrior.boost');
              actor.sprite.play('stand.' + facingNow);
              if (typeof onComplete === 'function') onComplete(sprite);
            });
          break;
        }
      break;
      case 'rest':
        var defaultFrame = actor.sprite.animations.currentFrame.index;
        tween = game.add.tween(actor.sprite).to({}, 1000);
        tween.onStart.addOnce(function(sprite) {
          sprite.play('rest');
          if (typeof onStart === 'function') onStart(sprite);
        });
        tween.onComplete.addOnce(function(sprite) {
          sprite.animations.stop();
          sprite.frame = defaultFrame;
          if (typeof onComplete === 'function') onComplete(sprite);
        });
      break;
    }
    return tween;
  }
};

