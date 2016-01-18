var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	// if (req.isAuthenticated()) {
	// 	return res.json(req.user);
	// }
	res.render('index');
});