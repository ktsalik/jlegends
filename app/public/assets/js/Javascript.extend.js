"use strict";

var objExtend = function(obj1, obj2) {
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
};

var EventsManager = function() {
  this.events = [];
  
  this.on = function(name, listener) {
    this.events.push({ name: name, listener: listener });
  };
  
  this.off = function(name) {
    for (var i = 0; i < this.events.length; i++)
      if (this.events[i].name === name) this.events.splice(i--, 1);
  };
  
  this.events.emit = function(name, args) {
    for (var event of this)
      if (event.name == name)
        event.listener(args);
  };
};
