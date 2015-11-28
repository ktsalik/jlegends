var mongoose = require('mongoose');

var CodeSchema = mongoose.Schema({
  code: { type: String, required: true },
  _character: { type: String, required: true, ref: 'Character' }
});

module.exports = CodeSchema;