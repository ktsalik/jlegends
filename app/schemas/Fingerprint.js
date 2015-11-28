var mongoose = require('mongoose');

var FingerprintSchema = mongoose.Schema({
  fingerprint: { type: String, required: true },
  _user: { type: String, required: true, ref: 'User' }
});

module.exports = FingerprintSchema;