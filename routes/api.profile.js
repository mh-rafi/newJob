module.exports = function(router, mongoose) {
	
	var User = mongoose.model('User');

	router.use(function(req, res, next) {
		if (!req.isAuthenticated()) {
			return res.status(401).redirect('/#login');
		};
		return next();
	});


	router.route('/profile')
		.get(function(req, res) {
			User.findById(req.user.id, function(err, user) {
				if (err) {
					return res.status(500).send({
						state: 'error',
						message: 'Could not find user'
					});
				};
				return res.json(user);
			});
		})
		.put(function(req, res) {
			User.findById(req.user.id, function(err, user) {
				if (err) {
					return res.status(500).send({
						state: 'error',
						message: 'Could not find user'
					});
				};
				user.update(req.body, function(err, user) {
					if (err) {
						return res.status(500).send({
							state: 'error',
							message: 'Can not update user'
						});
					};
					return res.json(user);
				});
			})
		});

};