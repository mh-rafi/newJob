var express = require('express');
var _ = require('underscore');
var router = express.Router();
var bCrypt = require('bcrypt-nodejs');
var nodemailer = require('nodemailer');
var mongoose = require('mongoose');
var User = mongoose.model('User');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('');

module.exports = function(passport) {
	router.get('/success', function(req, res) {
		console.log(req.user);
		res.send({
			state: 'success',
			user: req.user ? _.pick(req.user, '_id', 'username', 'role') : null
		});
	});

	router.get('/failure', function(req, res) {
		// console.log(req.test);
		res.send({
			state: 'failure',
			user: null,
			message: "Invalid username or password"
		});
	});

	router.post('/login', passport.authenticate('login', {
		successRedirect: '/auth/success',
		failureRedirect: '/auth/failure/'
	}));

	router.post('/signup', function(req, res) {
		User.findOne({
			$or: [{
				username: req.body.username
			}, {
				email: req.body.email
			}]
		}, function(err, user) {
			if (err) {
				return res.status(500).send({
					state: 'error',
					message: 'Server error!'
				});
			};
			if (user && user.username == req.body.username) {
				return res.status(400).send({
					state: 'error',
					message: 'Username already exists!'
				});
			};
			if (user && user.email == req.body.email) {
				return res.status(400).send({
					state: 'error',
					message: 'Email already exists!'
				});
			};

			var rand = Math.floor(100000 + Math.random() * 900000);
			var link = "http://" + req.get('host') + "/#/verify/?email=" + req.body.email + "&key=" + rand;

			var newUser = new User({
				role: 'user',
				username: req.body.username,
				email: req.body.email,
				email_verified: false,
				verific_code: rand
			});

			newUser.save(function(error, user) {
				if (error) {
					return res.status(500).send({
						state: 'error',
						message: 'Server error when saving user to database!'
					});
				};
				if (!user) {
					return res.status(404).send({
						state: 'error',
						message: 'User can not be saved!'
					});
				};

				// Send email now
				var mailOptions = {
					from: '<rafi.bogra@gmail.com>',
					to: req.body.email,
					subject: 'Verify your email - Newjob ✔',
					text: '',
					html: '<p>Please click on the link to verify your email address.<b><a href="' + link + '">Click here</a></b></p>'
				};

				// send mail with defined transport object
				transporter.sendMail(mailOptions, function(error, info) {
					if (error) {
						return console.log(error);
					};

					console.log('Email sent: ' + info.response);

					return res.status(200).send({
						state: 'success',
						message: 'Please check your email inbox!'
					});
				});
			});

		});
	});

	router.get('/verify', function(req, res) {
		if (req.query.hasOwnProperty('email') && req.query.hasOwnProperty('key')) {
			User.findOne({
				email: req.query.email,
				verific_code: req.query.key
			}, function(err, user) {
				if (err) {
					return res.status(500).send({
						state: 'error',
						message: 'Server error when searching email on database!'
					});
				};
				if (!user) {
					return res.status(400).send({
						state: 'error',
						message: 'Could not find email/key on database!'
					});
				};

				user.update({
					email_verified: true
				}, function(error, response) {
					if (error) {
						return res.status(500).send({
							state: 'error',
							message: 'Can not update verification status!'
						});
					};
					return res.status(200).send({
						state: 'success',
						message: 'Email verified! Now please set your password.'
					});
				});

			})
		}
	});

	router.post('/setpassword', function(req, res) {
		if (!req.body.email && !req.body.key) {
			return res.status(400).send({
				state: 'error',
				message: 'Bad data!'
			});
		};

		User.findOne({
			email: req.body.email,
			verific_code: req.body.key
		}, function(err, user) {
			if (err) {
				return res.status(500).send({
					state: 'error',
					message: 'Server error when searching user on database!'
				});
			};
			if (!user) {
				return res.status(404).send({
					state: 'error',
					message: 'Could not find user!'
				});
			};

			user.update({
				password: createHash(req.body.password)
			}, function(error, response) {
				if (error) {
					return res.status(500).send({
						state: 'error',
						message: 'Error occured while saving password!'
					});
				};
				res.status(200).send({
					state: 'success',
					message: 'Password has been saved!'
				});
			})
		})
	});

	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	var createHash = function(password) {
		var salt = bCrypt.genSaltSync(10);
		return bCrypt.hashSync(password, salt);
	}

	return router;
};
