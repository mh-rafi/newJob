module.exports = function(router, mongoose) {
	var User = mongoose.model('User');

	router.route('/user/:username')
		.get(function(req, res) {
			User.findOne({
				username: req.params.username
			}, function(err, user) {
				if (err) {
					return res.send({
						state: 'error',
						message: 'Could not find user'
					});
				};
				return res.json(user);
			});
		});
}