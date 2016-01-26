var mongoose = require('mongoose');
var _ = require('underscore');
var Message = mongoose.model('Message');
var User = mongoose.model('User');
var users = {};
module.exports = function(io) {
	io.on('connection', function(socket) {

		socket.on('new user', function(twoUsers) {
			// Store socket in users collection for current_user
			if (!_.has(users, twoUsers.curr_user) || socket.username !== twoUsers.curr_user) {
				socket.username = twoUsers.curr_user;
				users[socket.username] = socket;
			};

			// If another user is not provided
			if (!twoUsers.another_user) {
				console.log('Another user is not provided');
				return new Error('Another user is not provided');
			};

			// checks another user exists in database
			User.findOne({
				username: twoUsers.another_user
			}, function(err, anotherUser) {
				if (err) {
					console.log('Another user not found, server error');
					return err;
				};
				if (!anotherUser) {
					console.log('Another user %s not found', twoUsers.another_user);
					return err;
				};

				// Sends old messages
				var query = Message.find({
					$or: [{
						_sender: twoUsers.curr_user,
						_receiver: twoUsers.another_user
					}, {
						_sender: twoUsers.another_user,
						_receiver: twoUsers.curr_user
					}]
				});
				query.sort('created_at').exec(function(err, docs) {
					if (err) {
						console.log('Error in loading old messages')
						return err;
					}
					users[socket.username].emit('load old msgs', docs);
				});
			});
		});

		socket.on('message', function(msg) {
			var message = new Message({
				_sender: msg._sender,
				_receiver: msg._receiver,
				text: msg.text,
				is_read: msg.is_read
			});

			message.save(function(err, savedMessage) {
				if (err) {
					console.log('Error in saving new message')
					return err;
				};
				if (users[msg._receiver]) {
					users[msg._receiver].emit('message', {
						_sender: msg._sender,
						text: msg.text
					});
					// Mark the message as read since it was emited
					savedMessage.is_read = true;
					savedMessage.update(savedMessage, function(err, response) {
						if (err) {
							console.log('Error in updating saved message')
							return err;
						};
						console.log('Msg updated');
					});
				};

			});
		});

		// Sends connected users list to current_user
		socket.on('connected_users', function(currUser) {

			var query = Message.find({_receiver: currUser});
			query.sort({created_at: -1}).exec(function(err, msgs) {
				if (err) {
					console.log('Error in loading messages for users list')
					return err;
				};

				var userList = _.uniq(_.pluck(msgs, '_sender'));

				if(_.has(users, currUser)) {
					users[currUser].emit('connected_users', userList);
				} else {
					console.log('Can not find socket for currUser');
				};
			});
		});
	});
}