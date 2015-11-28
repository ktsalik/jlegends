var mongoose = require('mongoose');
var shortid = require('shortid');
var uuid = require('uuid');
var blueimpMd5 = require('blueimp-md5');

var UserSchema = mongoose.Schema({
  uuid: { type: String, unique: true, default: uuid.v4 },
  username: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String }
});

/**
 * Validations
 */
UserSchema.path('password').validate(function(value) {
  return typeof value === 'string' && value.trim().length >= 4;
}, 'cannot be less than 4 characters long');

/**
 * toJSON
 */
UserSchema.options.toJSON = {};
UserSchema.options.toJSON.transform = function(doc, obj, opts) {
  obj.id = doc._id;
  delete obj._id;
  delete obj.__v;
  delete obj.password;
};

/**
 * Methods
 */
UserSchema.pre('save', function(next) {
  this.password = blueimpMd5.md5(this.password);
  next();
});

UserSchema.statics.signup = function signup(details, callback) {
  return this.model('User').create({
    username: details.username,
    email: details.email,
    password: details.password
  }, callback);
};

UserSchema.statics.signin = function signin(credentials, callback) {
  return this.model('User').findOne({
    password: blueimpMd5.md5(credentials.password)
  }).or([
    { email: credentials.username },
    { username: credentials.username }
  ]).exec(callback);
};

module.exports = UserSchema;
