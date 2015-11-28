"use strict";

var async = require('async');
var express = require('express');
var mongodb = require('./mongodb.js');
var uuid = require('uuid');
var request = require('request');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(session({
  secret: 'jLegendsKeeper',
  saveUninitialized: true,
  resave: false,
  key: 'jlegends.sid',
  store: new MongoStore({
    mongooseConnection: mongodb.connection
  })
}));

app.use(function(req, res, next) {
  // middleware
  // req.session is present
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

io.use(function(socket, next) {
  // socket middleware
  next();
});

/* ---------- ROUTES ---------- */
/**
 * LOGIN
 */
app.route('/login')
  .get(function(req, res) {
    req.session.account = null;
    if (req.query.code) { // github login
      request.post({
        url: 'https://github.com/login/oauth/access_token',
        json: {
          client_id: 'b9563ea77cf0c8ec9442',
          client_secret: 'dc469cd3b9755bab75b8191f458d32c8519f2f30',
          code: req.query.code
        }
      }, function(err, response, body) {
        if (response.toJSON().statusCode == 200) {
          request.get({
            url: 'https://api.github.com/user?access_token=' + body.access_token, 
            headers: {
              'User-Agent': 'masterakos'
            }
          }, function(err, response, body) {
            body = JSON.parse(body);
            mongodb.User.findOne({ email: body.email }, function(err, user) {
              if (user) { // seen before
                req.session.account = user.toJSON();
                res.redirect('/');
              } else { // new user
                mongodb.User.collection.insert({
                  uuid: uuid.v4(),
                  email: body.email,
                  username: body.login,
                  password: ''
                }, function(err) {
                  if (!err) { mongodb.User.findOne({ email: body.email }, function(err, user) { req.session.account = user.toJSON(); res.redirect('/'); }); }
                });
              }
            });
          });
        }
      });
    } else {
      res.sendFile(__dirname + '/public/views/login.html');
    }
  })
  .post(function(req, res) {
    mongodb.User.signin(req.body, function(err, user) {
      if (user === null) {
        res.sendStatus(401);
      } else {
        req.session.account = user.toJSON();
        res.sendStatus(200);
      } 
    });
  });
  
/**
 * REGISTER
 */
app.post('/register', function(req, res) {
  async.waterfall([
    function(callback) { // check email uniqueness
      mongodb.User.count({ email: req.body.email }, function(err, count) { callback(null, count) });
    },
    function(emailExists, callback) { // check username uniqueness
      mongodb.User.count({ username: req.body.username }, function(err, count) { callback(null, emailExists, count) });
    }
  ], function (err, emailExists, usernameExists) {
    if (!emailExists && !usernameExists) { // create user
      mongodb.User.signup({ email: req.body.email || '', username: req.body.username || '', password: req.body.password || '' }, function(err, user) {
        if (err) { // errors caught by model
          var errors = [];
          for (var error in err.errors) {
            errors.push(error + ' ' + err.errors[error].message);
          }
          res.status(409).json({ errors: errors });
        } else { // created
          req.session.account = user.toJSON();
          res.sendStatus(200);
        }
      });
    } else { // errors
      var errors = [];
      if (emailExists) errors.push('Email already registered.');
      if (usernameExists) errors.push('Username is used by someone else.');
      res.status(409).json({ errors: errors });
    }
  });
});

/**
 * INDEX
 */
app.get('/', function(req, res) {  
  if (!req.session.account) {
    res.redirect('/login');
  } else {
    res.sendFile(__dirname + '/public/views/app.html');
  }
});

/**
 * CODE
 */
app.put('/code', function(req, res) {
 if (!req.session.account) { res.sendStatus(409); return; }
 mongodb.Character.findOne({ _user: req.session.account.id, _id: req.body.character }, function(err, char) {
   if (!char) { res.sendStatus(409); return; }
   char = char.toObject();
   mongodb.Code.findOne({ _character: char.id }, function(err, charCode) {
     if (!charCode) {
       mongodb.Code.create({
         code: req.body.code,
         _character: char.id
       }, function(err, save) {
         if (err) res.sendStatus(500);
         else res.sendStatus(200);
       });
     } else {
       charCode.code = req.body.code;
       charCode.save(function(err, save) { if (err) res.sendStatus(500); else res.sendStatus(200); });
     }
   });
 });
});
app.get('/code', function(req, res) {
 if (!req.session.account) { res.sendStatus(409); return; }
 mongodb.Code.findOne({ _character: req.query.character }, function(err, charCode) {
   if (err) res.sendStatus(500);
   else if (!charCode) res.send('');
   else res.send(charCode.code);
 });
});

/**
 * OTHER
 */
app.get('/login', function(req, res) { res.sendFile(__dirname + '/public/views/login.html'); });
app.get('/logout', function(req, res) { req.session.account = null; res.redirect('/login'); });
app.get('/tutorial', function(req, res) { req.session.account = null; res.sendFile(__dirname + '/public/views/tutorial.html'); });
app.get('/about', function(req, res) { res.sendFile(__dirname + '/public/views/about.html'); });
app.get('/me', function(req, res) { res.json(req.session.account); });
app.get('/get-chars', function(req, res) {
  if (!req.session.account) { res.sendStatus(409); return; }
  mongodb.Character.find({ _user: req.session.account.id }, function(err, chars) {
    res.json(chars);
  });
});

app.post('/create-char', function(req, res) {
  if (!req.session.account) { res.sendStatus(409); return; }
  mongodb.Character.create({
    class: req.body.class || '',
    name: req.body.name || '',
    _user: req.session.account.id
  }, function(err, char) {
    if (err) {
      res.sendStatus(409);
    } else {
      res.json(char);
    }
  });
});

var getPublicGames;
app.get('/games', function(req, res) {
  res.json(getPublicGames());
});

var onCreatePublicGame;
app.post('/create-public-game', function(req, res) {
  if (!req.session.account) { res.sendStatus(409); return; }
  var gameId = onCreatePublicGame(req.session.account, req.body);
  if (gameId) {
    res.send(gameId);
  } else {
    res.sendStatus(409);
  }
});

/**
 * EVERYTHING ELSE
 */
app.all('*', function(req, res) {
  res.redirect('/');
});

module.exports = {
  web: server,
  io: io,
  start: function(port, getPublicGamesFn, onCreatePublicGameFn) {
    if (typeof getPublicGamesFn !== 'function') console.log('Warning: Server requires a getPublicGamesFn parameter');
    else getPublicGames = getPublicGamesFn;
    if (typeof onCreatePublicGameFn !== 'function') console.log('Warning: Server requires a onCreatePublicGame parameter');
    else onCreatePublicGame = onCreatePublicGameFn;
    server.listen(port);
  }
};