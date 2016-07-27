var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var _ = require('underscore');

var User = mongoose.model('User');
var Job = mongoose.model('Job');

router.use(function(req, res, next) {
	console.log('MiddleWare log');
	// console.log(req.session.passport.user);
	if (req.method === 'GET') {
		return next();
	};
	if (!req.isAuthenticated()) {
		return res.status(401).redirect('/#login');
	}
	return next();
});

router.route('/jobs')
	/*--------------- Get all jobs----------------*/
	.get(function(req, res) {
		var where = {};

		if (req.query.hasOwnProperty('q') && typeof req.query.q === 'string') {
			console.log(req.query.q);
			where.text = new RegExp(req.query.q, 'i')
		}

		if (req.query.hasOwnProperty('username') && typeof req.query.username === 'string') {

			where._author = req.query.username;
		}

		Job.find(where, function(err, jobs) {
			if (err) {
				return res.status(500).send();
			}
			if (!jobs) {};
			return res.json(jobs);
		});
	})
	/*--------------- Add new job ----------------*/
	.post(function(req, res) {
		User.findById(req.user._id, function(err, user) {
			var job = new Job({
				_author: user.username,
				title: req.body.title,
				description: req.body.description,
				wage: req.body.wage,
				company: req.body.company,
				location: req.body.location,
				category: req.body.category,
				required_skills: req.body.required_skills,
				additional_requirements: req.body.additional_requirements
			});

			job.save(function(err, job) {
				if (err) {
					return res.status(500).send('error in abc');
				}
				return res.json(job);
			});
		});
	});


router.route('/jobs/:id')
	.get(function(req, res) {
		Job.findById(req.params.id, function(err, job) {
			if (err) {
				return res.status(404).send();
			}
			if (!job) {
				return res.status(404).send()
			}

			return res.json(job);
		});
	})
	.put(function(req, res) {
		Job.findOne({
			_id: req.params.id,
			_author: req.user.username
		}, function(err, job) {
			if (err) {
				return res.status(500).send(err);
			};
			if (!job) {
				return res.status(404).send()
			}
			job.update(req.body, function(err, job) {
				if (err) {
					return res.status(500).send(err);
				};
				return res.json(job);
			});
		});
	})
	/*--------------- Delete job ----------------*/
	.delete(function(req, res) {
		Job.findOne({
			_id: req.params.id,
			_author: req.user.username
		}, function(err, job) {
			if (err) {
				return res.status(500).send(err);
			};
			if (!job) {
				return res.status(404).send()
			}
			job.remove(function(err) {
				if (err) {
					return res.status(500).send({
						state: "error",
						message: "Sorry couldn't delete this job"
					})
				}
				return res.status(204).send({
					state: "success",
					message: "Job deleted"
				});
			});
		});
	});


/*---------------------apply test-------------------------*/
router.route('/apply/:id')
	.put(function(req, res) {
		Job.findOne({
			_id: req.params.id
		}, function(err, job) {
			if (err) {
				return res.send({
					state: 'error',
					message: 'Could not find job'
				})
			};
			// author can not apply his own job
			if (job._author === req.user.username) {
				return res.send({
					state: 'error',
					message: 'You can not apply your own job'
				});
			}
			// can't apply twice
			if (_.contains(job.applicants, req.user.username)) {
				return res.send({
					state: 'error',
					message: 'You already applied this job'
				});
			}

			job.applicants.push(req.user.username);
			job.save(function(err, job) {
				if (err) {
					return res.send({
						state: 'error',
						message: 'Could not submit your application'
					});
				};
				return res.send({
					state: 'success',
					message: 'Application submitted'
				});
			})
		})
	})

// Public profile
var pubProfile = require('./api.user.js')(router, mongoose);

// Private profile
var privateProfile = require('./api.profile.js')(router, mongoose);

module.exports = router;