var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Job = mongoose.model('Job');

module.exports = function(passport) {

	/*------------ Provides sesions to user id -------------*/
	passport.serializeUser(function(user, done) {
		console.log('serializing user');
		done(null, user._id);
	});

	/*---------- Checks user exists on databese by sessions id -----------*/
	passport.deserializeUser(function(id, done) {
		console.log('deserializing user');
		User.findById(id, function(err, user) {
			if(err) {
				return done(err, false)
			}
			done(null, user);
		});
	});

	/*-----------------Log in strategy---------------------*/
	passport.use('login', new LocalStrategy({

		passReqToCallback: true

	}, function(req, username, password, done) {

		User.findOne({
			username: username
		}, function(err, user) {
			if (err) {
				return done(err, false);
			}
			if (!user) {
				return done('User not found', false)
			}
			if (!isValidPassword(user, password)) {
				return done('Incorrect password')
			}
			return done(null, user);
		});
	}));

	/*-----------------Sign up strategy---------------------*/
	passport.use('signup', new LocalStrategy({

		passReqToCallback: true

	}, function(req, username, password, done) {
		console.log('username: ' + username);

		User.findOne({
			username: username
		}, function(err, user) {
			if (err) {
				console.log('first error');
				return done(err, false);
			}
			if (user) {
				console.log('Username already taken');
				return done('Username already taken', false)
			}

			var newUser = new User({
				username: username,
				password: createHash(password)
			});
			newUser.save(function(err, user) {
				if (err) {
					console.log('2nd error');
					return done(err, false);
				}
				console.log('Registration successful for %s', username);
				return done(null, user)
			});
		});
	}));

	var isValidPassword = function(user, passwordProvided) {
		return bCrypt.compareSync(passwordProvided, user.password);
	};

	var createHash = function(password) {
		var salt = bCrypt.genSaltSync(10);
		return bCrypt.hashSync(password, salt);
	}
}