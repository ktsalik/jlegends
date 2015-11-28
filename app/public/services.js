"use strict";

var services = angular.module('services', []);

services.factory('socket', function(socketFactory) {
  return socketFactory();
});

var defineGet = function(context, name, getFunction) {
  Object.defineProperty(context, name, {
    get: getFunction
  });
};

services.service('chatService', function() {
  var Message = function(params) {
    this.username = params.username;
    this.text = params.text;
    this.type = params.type;
    this.system = params.system || false;
  };
  
  var ROOMS = ['public', 'game'];
  
  var messages = [];
  
  defineGet(this, 'messages', function() { return messages; });
  
  ROOMS.forEach(function(type) {
    defineGet(this.messages, type, function() { return this.getWhere('type', type); });
  }.bind(this));
  
  this.push = function(params) {
    messages.push(new Message(params));
  };
  
});