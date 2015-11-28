var METHODS = {
  orientation: {
    inRange: {
      declaration: "inRange(target):Boolean",
      description: "Returns true if the target is within your attack range, false otherwise.",
      example: "var enemy = getEnemy();\n" +
      "\n" +
      "if (inRange(enemy)) {\n" +
      "  // Attack!\n" +
      "}"
    },
    distanceFrom: {
      declaration: "distanceFrom(target):Number",
      description: "Returns current distance from the target (in meters).",
      example: "var enemy = getEnemy();\n" +
      "var distance = distanceFrom(enemy);\n" +
      "\n" +
      "if (distance < 0) {\n" +
      "  // enemy is on your left\n" + 
      "  var meters = Math.abs(distance);\n" +
      "}\n" +
      "\n" +
      "if (distance > 0) {\n" +
      "  // enemy is on your right\n" +
      "  var meters = Math.abs(distance);\n" +
      "}"
    }
  },
  tactics: {
    getEnemy: {
      declaration: "getEnemy():Object",
      description: "Returns an object representing your first enemy.",
      note: "not the closest enemy!",
      example: "var enemy = getEnemy();\n" +
      "enemy.hp // hitpoints\n" +
      "enemy.range // attack range"
    },
    getEnemies: {
      declaration: "getEnemies():Array",
      description: "Returns an array of all your enemies.",
      example: "var enemies = getEnemies();\n" +
      "enemies[0].hp // hitpoints\n" +
      "enemies[0].range // attack range"
    }
  },
  actions: {
    move: {
      declaration: "move(direction, meters)",
      description: "Move left or right.",
      note: "If you don't pass a second argument your character will move at the end of the given direction.",
      example: "move('right', 4);\n" +
      "move('left', 2);\n" +
      "\n" +
      "move('left'); // move left until the end of the stage"
    },
    moveTo: {
      declaration: "moveTo(target)",
      description: "Move in front of your enemy.",
      example: "var enemy = getEnemy();\n" +
      "\n" +
      "moveTo(enemy);\n" +
      "// you're now next to the enemy"
    },
    attack: {
      declaration: "attack(target)",
      description: "Attack an enemy (physically).",
      example: "var enemy = getEnemy();\n" +
      "\n" +
      "attack(enemy);"
    },
    cast: {
      declaration: "cast(spell, target)",
      description: "Cast a spell upon the given target.",
      example: "var enemy = getEnemy();\n" +
      "\n" +
      "// damage your enemy\n" +
      "cast('crystal-spike', enemy);\n" +
      "\n" +
      "// and heal yourself\n" +
      "cast('heal', me);"
    },
    use: {
      declaration: "use(skill, target)",
      description: "Use a skill. Target is optional depending on the skill.",
      example: "var enemy = getEnemy();\n" +
      "\n" +
      "// use 'rutheless-shot' as a ranger\n" +
      "use('ruthless-shot', enemy);"
    },
    rest: {
      declaration: "rest()",
      description: 'By resting you gain 20% of your total life.',
      note: "Your character must be out of all your enemies attack range in order to rest.\n",
      example: "rest();\n" +
      "\n" +
      "if (me.hp < 20) // low life !\n" +
      "  rest();\n"
    }
  }
};

var SPELLS = {
  priest: [
    {
      name: 'Heal',
      example: "cast('heal', me)"
    },
    {
      name: 'Crystal Spike',
      example: "cast('crystal-spike', enemy)"
    }
  ],
  mage: [
    {
      name: 'Unstable Power',
      example: "cast('unstable-power', enemy)"
    },
    {
      name: 'Ignite',
      example: "cast('ignite', enemy)"
    },
    {
      name: 'Mana Shield',
      example: "cast('mana-shield', me)"
    }
  ]
};

var SKILLS = {
  ranger: [
    {
      name: 'Ruthless Shot',
      example: "use('ruthless-shot', enemy)"
    }
  ],
  warrior: [
    {
      name: 'Righteous Fury',
      example: "use('righteous-fury')"
    }
  ]
};