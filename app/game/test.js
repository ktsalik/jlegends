"use strict";
var repl = require('repl');
var Game = require('./Game.js');

var g = new Game({
  sectors: 20,
  players: [{
    name: "Masterakos",
    type: 'warrior',
    level: 1
  }]
});

g.npcs.add({
  name: "Bad Orc",
  type: "warrior",
  position: { x: 15 },
  level: 1
});

var p = g.players[0];
var mob1 = g.npcs[0];

g.npcs[0].strength = g.npcs[0].agility = g.npcs[0].vitality = g.npcs[0].energy = 10;
g.players[0].strength = 30;
g.players[0].agility = 30;

var console = repl.start({
  prompt: ">> ",
  input: process.stdin,
  output: process.stdout
});

console.context.g = g;
