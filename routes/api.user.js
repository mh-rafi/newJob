var bCrypt = require('bcrypt-nodejs');

module.exports = function(router, mongoose) {
	var User = mongoose.model('User');

	router.use(function(req, res, next) {
		if (req.user.role == "admin") {
			return next();
		};

		if (req.method !== "GET") {
			return res.status(401).send({
				state: 'error',
				message: 'Authentication error!'
			});
		}
		next();
	});

	router.route('/user')
		.get(function(req, res) {

			if (req.user.role !== "admin") {
				console.log(req.user.role);
				return res.status(401).send({
					state: 'error',
					message: 'Authentication error!'
				})
			}
			// console.log(req.user.role);
			User.find({}, function(err, users) {
				if (err) {
					return res.status(500).send({
						state: 'error',
						message: 'Server error!'
					});
				}
				if (!users) {

					return res.status(404).send({
						state: 'error',
						message: 'Could not find user!'
					});
				}

				res.json(users);
			})
		})
		.post(function(req, res) {
			User.findOne({
				username: req.body.username
			}, function(err, user) {
				if (err) {
					return res.status(500).send({
						state: 'error',
						message: 'Server error!'
					});
				};

				if (user) {
					return res.status(400).send({
						state: 'error',
						message: 'username already taken!'
					});
				};

				var newUser = new User({
					username: req.body.username,
					password: req.body.password,
					role: req.body.role
				});

				newUser.save(function(err, data) {
					if (err) {
						return res.status(500).send({
							state: 'error',
							message: 'Server error!'
						});
					};

					res.status(200).send({
						state: 'success',
						message: 'user added!'
					});
				});

			});
		});
		

	router.route('/user/:username')
		.get(function(req, res) {
			if (!req.params.hasOwnProperty('username')) {
				return res.send({
					state: 'error',
					message: 'No username provided!'
				});
			} else {
				User.findOne({
					username: req.params.username
				}, function(err, user) {
					if (err) {
						return res.send({
							state: 'error',
							message: 'Could not find user!'
						});
					};
					return res.json(user);
				});
			}

		})
		.delete(function(req, res) {
			User.findOne({
				username: req.params.username
			}, function(err, user) {
				if (err) {
					return res.status(500).send({
						state: "error",
						message: "Sorry, error in finding user!"
					});
				};
				if (!user) {
					return res.status(404).send({
						state: "error",
						message: "Sorry, couldn't find user!"
					});
				};
				user.remove(function(err) {
					if (err) {
						return res.status(500).send({
							state: "error",
							message: "Sorry couldn't delete user!"
						});
					};

					res.status(200).send({
						state: "success",
						message: "User deleted!"
					});
					
				})
			})
		});
}

var isValidPassword = function(user, passwordProvided) {
	return bCrypt.compareSync(passwordProvided, user.password);
};

var createHash = function(password) {
	var salt = bCrypt.genSaltSync(10);
	return bCrypt.hashSync(password, salt);
}