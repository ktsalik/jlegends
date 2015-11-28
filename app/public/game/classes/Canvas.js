// "use strict"; // TODO: disabled this temporary: http://craigsworks.com/projects/forums/showthread.php?tid=3649

var Canvas = function(game, options) {
  var canvas = this;
  
  this.ready = false; // onLoadComplete
  
  EventsManager.call(this);
  
  this.width = options.width;
  this.height = options.height;
  this.stageStep = this.width / game.sectors;
  
  this.landscape = {
    image: null
  };
  
  this.ground = {
    sprite: null
  };
  
  this.hades = {
    sprite: null
  };
  
  this.players = [];
  
  this.npcs = [];
  
  Object.defineProperty(this, 'entities', { get: function() { return this.players.concat(this.npcs); } });
  
  Object.defineProperty(this, 'character', { get: function() { return this.players.getBy('id', game.character.id); } });
  
  this.buffs = [];
  
  this.lifebars = {
    graphics: null
  };
  
  this.manabars = {
    graphics: null
  };
  
  this.ragebars = {
    graphics: null
  };
  
  this.expbar = {
    graphics: null
  };
  
  this.chat = {
    logs: ['foo', 'bar', 'bar', 'qux'],
    graphics: null
  };
  
  this.effects = {
    damage: null
  };
  
  this.draw = {
    lifebars: null,
    manabars: null,
    ragebars: null,
    buffs: null,
    chat: null
  };
  
  this.tweens = [];
  this.tweens.sequence = 1;
  this.tweens.push = function() {
    for (var tween in arguments) {
      tween = arguments[tween];
      tween.id = this.sequence++;
      tween.onComplete.addOnce(function() { canvas.tweens.completed(tween.id); });
    }
    /* keep this off for a while for the sake of firefox 12 -_-
    for (var tween of arguments) {
      tween.id = this.sequence++;
      tween.onComplete.addOnce(function() { canvas.tweens.completed(tween.id); });
    }
    */
    if (this.some(function(tween) { return tween.isRunning; }) == false) {
      tween.start();
      canvas.events.emit('tweens.started');
    }
    return Array.prototype.push.apply(this, arguments);
  };
  this.tweens.completed = function(tweenId) {
    this.removeWhere('id', tweenId);
    if (this.length > 0) {
      this[0].start();
    } else {
      canvas.events.emit('tweens.empty');
    }
  };
  
  Object.defineProperty(this, 'animating', { get: function() { return this.tweens.count > 0; } });
  
  this.game = new Phaser.Game(this.width, this.height, Phaser.AUTO, 'canvas', {
    preload: this.preload(game),
    create: this.create(game),
    update: this.update(),
    render: this.render(game)
  });
  
  this.play = function(turn) {
    function handleAfterEffects(afterEffects) {
      afterEffects.forEach(function(effect) {
        var character = canvas.entities.getBy('id', effect.character);
        switch (effect.type) {
          case 'property.change': character[effect.property] += effect.value; break;
          case 'heal': character.hp += effect.value; canvas.effects.heal(character, effect.value); break;
          case 'buff': canvas.buffs.push({ character: effect.character, name: effect.buff });  break;
          // case 'xp': canvas.effects.experience(character, effect.value); break;
        }
      });
    }

    var actor = canvas.entities.getBy('id', turn.actor.split('.')[1]);
    turn.actions.forEach(function(action) {
      switch (action.type) {
        case 'move':
          var point = canvas.positionToPixels(action.position.x);
          var moveTween = actor.generateTween(canvas, 'move', { point: point });
          canvas.tweens.push(moveTween);
        break;
        case 'attack':
          var target = canvas.entities.getBy('id', action.target)
          var attackTween = actor.generateTween(canvas, 'attack', { target: target }, null, function() {
            canvas.effects.damage(target, action.damage);
            target.hp -= action.damage;
            handleAfterEffects(action.afterEffects);
            if (target.hp === 0) target.sprite.play('death');
          });
          canvas.tweens.push(attackTween);
        break;
        case 'cast':
          var target = canvas.entities.getBy('id', action.target)
          var castTween = actor.generateTween(canvas, 'cast', { spell: action.spell, target: target }, null, function() {
            if (action.damage) {
              canvas.effects.damage(target, action.damage);
              target.hp -= action.damage;
            }
            handleAfterEffects(action.afterEffects);
            if (target.hp === 0) target.sprite.play('death');
          });
          canvas.tweens.push(castTween);
        break;
        case 'use':
          var target = canvas.entities.getBy('id', action.target)
          var castTween = actor.generateTween(canvas, 'use', { skill: action.skill, target: target }, null, function() {
            if (action.damage) {
              canvas.effects.damage(target, action.damage);
              if (target)
                target.hp -= action.damage;
            }
            handleAfterEffects(action.afterEffects);
            if (target && target.hp === 0) target.sprite.play('death');
          });
          canvas.tweens.push(castTween);
        break;
        case 'rest':
          var restTween = actor.generateTween(canvas, 'rest', { }, null, function() {
            handleAfterEffects(action.afterEffects);
          });
          canvas.tweens.push(restTween);
        break;
      }
    });
  };
  
  // FIXME: this logic is temporary
  this.afterPlay = function() {
    // clear dead npcs
    this.npcs.forEach(function(npc, i) {
      if (game.npcs.getBy('id', npc.id) === null && !npc.removeTimeout) {
        npc.removeTimeout = canvas.game.time.events.add(Phaser.Timer.SECOND * 5, function() {
          canvas.npcs.getBy('id', npc.id).remove();
        });
      }
    });
    this.players.forEach(function(player, i) {
      var gameInstance = game.players.getBy('id', player.id);
      if (!gameInstance) { // player left
        canvas.players.getBy('id', player.id).remove();
      } else {
        player.sprite.x = canvas.positionToPixels(gameInstance.position.x);
      }
    });
    game.players.forEach(function(player) {
      if (canvas.players.getBy('id', player.id) === null) { // player joined
        canvas.spawn.player(player);
      }
    });
    game.npcs.forEach(function(npc) {
      if (canvas.npcs.getBy('id', npc.id) === null) { // new npc
        canvas.spawn.npc(npc);
      }
    });
    // Entropy changes things
    canvas.entities.forEach(function(entity, i) {
      var gameEntity = game.entities.getBy('id', entity.id);
      if (!gameEntity) return; // dead npc
      ['level', 'experience', 'mp', 'rage', 'life', 'mana', 'hp', 'mp'].forEach(function(property) {
        entity[property] = gameEntity[property];
      });
      canvas.buffs.forEach(function(buff, i) {
        if (buff.character == gameEntity.id) {
          if (gameEntity.buffs.getBy('name', buff.name) === null) { // buff expired
            canvas.buffs.removeAt(i);
            if (buff.name == 'righteous-fury') { // FIXME: that's an exception
              if (entity.hp > 0) {
                var facingNow = entity.sprite.animations.currentAnim.name.split('.')[1];
                entity.sprite.loadTexture('human.warrior');
                entity.sprite.play('stand.' + facingNow);
              }
            }
          }
        }
      });
    });
  };
  this.on('tweens.empty', function() {
    canvas.afterPlay();
  });
  
  this.draw.lifebars = function() {
    if (this.lifebars.graphics === null) {
      this.lifebars.graphics = canvas.game.add.graphics();
    } else {
      this.lifebars.graphics.clear();
    }
    
    var g = this.lifebars.graphics;
    
    this.npcs.forEach(function(npc) {
      var sprite = npc.sprite;
      if (sprite.inWorld) {
        g.beginFill('0x800000');
        g.drawRect(
          sprite.body.center.x - ((sprite.body.width * 0.5) / 2),
          sprite.body.center.y - (sprite.body.height * 0.425),
          sprite.body.width * 0.5,
          sprite.body.height * 0.05
        );
        g.endFill();
        g.beginFill('0xFF0000');
        g.drawRect(
          sprite.body.center.x - ((sprite.body.width * 0.5) / 2),
          sprite.body.center.y - (sprite.body.height * 0.425),
          (sprite.body.width * 0.5) * (npc.hp / npc.life),
          sprite.body.height * 0.05
        );
        g.endFill();
      }
    });
    
    this.players.forEach(function(player) {
      var sprite = player.sprite;
      g.beginFill('0x006600');
      g.drawRect(
        sprite.body.center.x - ((sprite.body.width * 0.8) / 2),
        sprite.body.center.y - (sprite.body.height * 0.55),
        sprite.body.width * 0.8,
        sprite.body.height * 0.1
      );
      g.endFill();
      g.beginFill('0x33CC33');
      g.drawRect(
        sprite.body.center.x - ((sprite.body.width * 0.8) / 2),
        sprite.body.center.y - (sprite.body.height * 0.55),
        (sprite.body.width * 0.8) * (player.hp / player.life),
        sprite.body.height * 0.1
      );
      g.endFill();
    });

  }.bind(this);
  
  this.draw.manabars = function() {
    if (this.manabars.graphics === null) {
      this.manabars.graphics = canvas.game.add.graphics();
    } else {
      this.manabars.graphics.clear();
    }
    
    var g = this.manabars.graphics;
    
    function drawManabar(sprite, width, percent, y) {
      g.beginFill('0x00256E');
      g.drawRect(
        sprite.body.center.x - ((sprite.body.width * width) / 2),
        sprite.body.center.y - (sprite.body.height * y),
        sprite.body.width * width,
        sprite.body.height * 0.05
      );
      g.endFill();
      g.beginFill('0x3030FF');
      g.drawRect(
        sprite.body.center.x - ((sprite.body.width * width) / 2),
        sprite.body.center.y - (sprite.body.height * y),
        (sprite.body.width * width) * percent,
        sprite.body.height * 0.05
      );
      g.endFill();
    }
    
    this.players.forEach(function(player) {
      if (typeof player.mana === 'number') {
        drawManabar(player.sprite, 0.7, (player.mp / player.mana), 0.615);
      }
    });
    /*
    this.npcs.forEach(function(npc) {
      if (typeof npc.mana === 'number') {
        drawManabar(npc.sprite, 0.4, (npc.mp / npc.mana), 0.485);
      }
    });
    */
  }.bind(this);
  
  this.draw.ragebars = function() {
    if (this.ragebars.graphics === null) {
      this.ragebars.graphics = canvas.game.add.graphics();
    } else {
      this.ragebars.graphics.clear();
    }
    
    var g = this.ragebars.graphics;
    
    function drawRagebar(sprite, width, percent, y) {
      g.beginFill('0x993300');
      g.drawRect(
        sprite.body.center.x - ((sprite.body.width * width) / 2),
        sprite.body.center.y - (sprite.body.height * y),
        sprite.body.width * width,
        sprite.body.height * 0.05
      );
      g.endFill();
      g.beginFill('0xFF6600');
      g.drawRect(
        sprite.body.center.x - ((sprite.body.width * width) / 2),
        sprite.body.center.y - (sprite.body.height * y),
        (sprite.body.width * width) * percent,
        sprite.body.height * 0.05
      );
      g.endFill();
    }

    this.players.forEach(function(player) {
      if (typeof player.rage === 'number') {
        drawRagebar(player.sprite, 0.7, (player.rage / 100), 0.615);
      }
    });
    /*
    this.npcs.forEach(function(npc) {
      if (typeof npc.rage === 'number') {
        drawRagebar(npc.sprite, 0.4, (npc.rage / 100), 0.485);
      }
    });
    */
  }.bind(this);
  
  this.draw.experience = function() {
    if (this.expbar.graphics === null) {
      this.expbar.graphics = canvas.game.add.graphics();
      this.expbar.label = this.game.add.text(
        this.game.world.width * 0.01,
        this.game.world.height * 0.01,
        "Level " + this.character.level,
        { font: "13px blackops", fill: "#FFC107" }
      ); 
    } else {
      this.expbar.graphics.clear();
    }
    
    var g = this.expbar.graphics;
    
    this.expbar.label.setText('Level ' + this.character.level);
    
    g.beginFill('0xB28F00');
    g.drawRect(
      this.expbar.label.x,
      this.expbar.label.y + this.expbar.label.height,
      this.game.world.width * 0.5,
      this.game.world.height * 0.015
    );
    g.endFill();
    
    g.beginFill('0xFFC107');
    g.drawRect(
      this.expbar.label.x,
      this.expbar.label.y + this.expbar.label.height,
      (this.game.world.width * 0.5) * (this.character.experience / Math.round(Math.pow(this.character.level, 2) * 33.33)),
      this.game.world.height * 0.015
    );
    g.endFill();
  }.bind(this);
  
  this.effects = {
    damage: function(target, damage) {
      var text = this.game.add.text(
        target.sprite.body.x,
        target.sprite.body.y - target.sprite.body.height * 0.55,
        '-' + damage.toFixed(),
        { font: "25px blackops", fill: "#FF0000", align: "center" }
      );
      var moveUp = this.game.add.tween(text).to({ y: text.position.y - 10 }, 250);
      var fadeOut = this.game.add.tween(text).to({ alpha: 0 }, 350);
      moveUp.chain(fadeOut);
      fadeOut.onComplete.addOnce(function() {
        canvas.game.world.remove(text);
      });
      moveUp.start();
    }.bind(this),
    heal: function(target, hp) {
      var text = this.game.add.text(
        target.sprite.body.x,
        target.sprite.body.y - target.sprite.body.height * 0.55,
        '+' + hp.toFixed(),
        { font: "25px blackops", fill: "#33CC33", align: "center" }
      );
      var moveUp = this.game.add.tween(text).to({ y: text.position.y - 10 }, 250);
      var fadeOut = this.game.add.tween(text).to({ alpha: 0 }, 350);
      moveUp.chain(fadeOut);
      fadeOut.onComplete.addOnce(function() {
        canvas.game.world.remove(text);
      });
      moveUp.start();
    }.bind(this),
    experience: function(target, points) {
      var text = this.game.add.text(
        target.sprite.body.x,
        target.sprite.body.y - target.sprite.body.height * 0.65,
        '+' + points.toFixed() + ' xp',
        { font: "bold 20px blackops", fill: "#FF9900", align: "center" }
      );
      var moveUp = this.game.add.tween(text).to({ y: text.position.y - 10 }, 700);
      var moveToBar = this.game.add.tween(text).to({ x: 0, y: 0, alpha: 0 }, 700);
      moveUp.chain(moveToBar)
      moveToBar.onComplete.addOnce(function() {
        canvas.game.world.remove(text);
      });
      moveUp.start();
    }.bind(this),
  };
  
  this.spawn = {
    player: function(options) {
      var player = {
        id: options.id,
        level: options.level,
        experience: options.experience,
        hp: options.hp,
        life: options.life,
        mp: options.mp,
        mana: options.mana,
        rage: options.rage,
        spriteKey: options.race + '.' + options.type,
        sprite: null,
        nameText: null
      };
      Animations.grant.call(player, options.race, options.type);

      var sprite = canvas.game.add.sprite(canvas.positionToPixels(options.position.x), canvas.ground.sprite.y - 64, player.spriteKey);
      canvas.game.physics.arcade.enable(sprite);
      sprite.body.gravity.y = 300;
      sprite.body.bounce.y = 0.1;
      sprite.collideWorldBounds = true;
      player.sprite = sprite;
      // animations
      player.animations.forEach(function(animation) {
        player.sprite.animations.add(
          animation.name,
          Phaser.Animation.generateFrameNames('sprite', animation.frames.first, animation.frames.last),
          animation.speed,
          animation.repeat
        );
      });
      player.sprite.play('stand.right');
      player.nameText = canvas.game.add.text(0, 0, "", { font: "10px source-code", fill: "#FFC107", align: "center" });
      player.remove = function() {
        this.sprite.destroy();
        canvas.game.world.remove(this.nameText);
        for (var i = 0; i < canvas.players.length; i++) if (canvas.players[i].id == this.id) { canvas.players.removeAt(i); break; }
      };
      canvas.players.push(player);
    },
    npc: function(options) {
      var npc = {
        id: options.id,
        spriteKey: options.race + '.' + options.type,
        sprite: null,
        hp: options.hp,
        life: options.life,
        mp: options.mp,
        mana: options.mana,
        rage: options.rage
      };
      Animations.grant.call(npc, options.race, options.type);

      var sprite = canvas.game.add.sprite(canvas.positionToPixels(options.position.x), canvas.ground.sprite.y - 64, npc.spriteKey);
      canvas.game.physics.arcade.enable(sprite);
      sprite.body.gravity.y = 300;
      sprite.body.bounce.y = 0.1;
      sprite.collideWorldBounds = true;
      npc.sprite = sprite;
      // animations
      npc.animations.forEach(function(animation) {
        npc.sprite.animations.add(
          animation.name,
          Phaser.Animation.generateFrameNames('sprite', animation.frames.first, animation.frames.last),
          animation.speed,
          animation.repeat
        );
      });
      npc.sprite.animations.play('stand.right');
      npc.remove = function() {
        this.sprite.destroy();
        canvas.game.world.remove(this.levelText);
        for (var i = 0; i < canvas.npcs.length; i++) if (canvas.npcs[i].id == this.id) { canvas.npcs.removeAt(i); break; }
      };
      
      npc.levelText = canvas.game.add.text(npc.sprite.x, npc.sprite.y, options.level, { font: "10px source-code", fill: "#FF0000" });
      canvas.npcs.push(npc);
      
    }
  };
  
  this.draw.buffs = function() {
    canvas.buffs.forEach(function(buff) {
      var character = canvas.entities.getBy('id', buff.character);
      var buffKey = 'buff.' + buff.name;
      if (character.sprite.children.getBy('key', buffKey) === null) {
        var buff = character.sprite.addChild(canvas.game.make.sprite(character.sprite.body.width / 2, character.sprite.body.width / 2, buffKey));
        buff.width = character.sprite.width * 1.5;
        buff.height = character.sprite.height * 1.5;
        buff.anchor.setTo(0.5, 0.5);
        buff.animations.add('animation').play(canvas.game.cache.getFrameCount(buffKey), true);
      }
    });
    canvas.entities.forEach(function(entity) {
      entity.sprite.children.forEach(function(sprite) {
        if (sprite.key.split('.')[0] == 'buff') {
          var name = sprite.key.split('.')[1];
          var currentBuffs = canvas.buffs.getWhere('character', entity.id);
          if (currentBuffs.getBy('name', name) === null)
            sprite.destroy();
        }
      });
    });
  };

};

Canvas.prototype.positionToPixels = function(x) {
  return (x * this.stageStep) - this.stageStep;
};
