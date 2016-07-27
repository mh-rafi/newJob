var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
	role: String,
	first_name: String,
	last_name: String,
	age: Number,
	title: String,
	bio: String,
	email: String,
	website: String,
	location: String,
	edu_degrees: String,
	experience: String,
	career_level: String,
	skills: [],
	other_skills: [],
	linkedin: String,
	twitter: String,
	username: String,
	password: String,
	email_verified: Boolean,
	verific_code: String,
	created_at: {type: Date, default: Date.now()}
});

var jobSchema = Schema({
	_author: {type: String, ref: 'User'},
	title: String,
	company: String,
	description: String,
	wage: Number,
	location: String,
	category: String,
	required_skills: [],
	additional_requirements: [],
	applicants: [{ type: String, ref: 'User' }],
	created_at: {type: Date, default: Date.now()}
});

var msgSchema = Schema({
	_sender: {type: String, ref: 'User'},
	_receiver: {type: String, ref: 'User'},
	text: String,
	is_read: Boolean,
	created_at: {type: Date, default: Date.now()}
});


mongoose.model('User', userSchema);
mongoose.model('Job', jobSchema);
mongoose.model('Message', msgSchema);