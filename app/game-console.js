var colors = require('colors');

var GameConsole = function(listener) {

  process.stdout.write('\033c');
  console.log("/--------------------------------- jLegends ---------------------------------\\".green);
  console.log("|                                                                            |".green);
  console.log("|                               Version: 0.0.1                               |".green);
  console.log("\\----------------------------------------------------------------------------/".green);
  console.log();
  console.log(" type: /help to list commands".blue);
  console.log(" type: /clear to clear console".blue);
  console.log();
  process.stdout.write(">> ");

  process.stdin.resume();
  process.stdin.on('data', function(data) {
    var input = data.toString().trim();
    if (input[0] === '/') {
      var command = commands[input.substr(1)];
      if (command) command();
    } else {
      try {
        listener(input);
      } catch (err) {
        console.log(err.toString().red);
      }
    }
    process.stdout.write(">> ");
  });

  var commands = {
    clear: function() {
      process.stdout.write('\033c');
    },
    help: function() {
      console.log();
      console.log(" Usage:");
      console.log()
      console.log("   /" + "<command>".blue);
      console.log();
      console.log(" Commands:");
      console.log();
      console.log("   clear          Clear console logs")
      console.log();
    }
  };
  
};

module.exports = GameConsole;