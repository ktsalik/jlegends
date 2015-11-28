"use strict";

var mongoose = require('mongoose');
var UserSchema = require('./schemas/User.js');
var CharacterSchema = require('./schemas/Character.js');
var CodeSchema = require('./schemas/Code.js');
var FingerprintSchema = require('./schemas/Fingerprint.js');

mongoose.connect('mongodb://localhost/jlegends');

var SessionSchema = new mongoose.Schema({
  _id: String
});

var Session = mongoose.model('session', SessionSchema);
var User = mongoose.model('User', UserSchema);
var Character = mongoose.model('Character', CharacterSchema);
var Code = mongoose.model('Code', CodeSchema);
var Fingerprint = mongoose.model('Fingerprint', FingerprintSchema);

module.exports.connection = mongoose.connection;
module.exports.Session = Session;
module.exports.User = User;
module.exports.Character = Character;
module.exports.Code = Code;
module.exports.Fingerprint = Fingerprint;