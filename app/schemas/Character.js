var mongoose = require('mongoose');

var CharacterSchema = mongoose.Schema({
  class: { type: String, required: true },
  name: { type: String, required: true },
  level: { type: Number, required: true, default: 1 },
  experience: { type: Number, required: true, default: 0 },
  build: {
    strength: { type: Number, required: true, default: 0 },
    agility: { type: Number, required: true, default: 0 },
    vitality: { type: Number, required: true, default: 0 },
    energy: { type: Number, required: true, default: 0 }
  },
  _user: { type: String, required: true, ref: 'User' }
});

/**
 * Validations
 */
CharacterSchema.path('class').validate(function(value) {
  return typeof value === 'string' && ['warrior', 'ranger', 'priest', 'mage'].indexOf(value) > -1;
}, 'invalid class');

CharacterSchema.path('class').validate(function(value) {
  return typeof value === 'string' && value.trim().length > 0 && value.length < 20;
}, 'invalid name');

/**
 * toJSON
 */
CharacterSchema.options.toJSON = {};
CharacterSchema.options.toJSON.transform = function(doc, obj, opts) {
  obj.id = doc._id.toString();
  delete obj._id;
  delete obj.__v;
  delete obj._user;
};

/**
 * toObject
 */
CharacterSchema.options.toObject = {};
CharacterSchema.options.toObject.transform = function(doc, obj, opts) {
  obj.id = doc._id.toString();
  delete obj._id;
  delete obj.__v;
  delete obj._user;
};

module.exports = CharacterSchema;