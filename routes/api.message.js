var mongoose = require('mongoose');
var Message = mongoose.model('Message');
var users = {};
module.exports = function(io) {
	io.on('connection', function(socket) {

		socket.on('new user', function(twoUsers) {
			socket.username = twoUsers.curr_user;
			users[socket.username] = socket;
			// console.log(users);

			var query = Message.find({
				$or: [{
					_sender: socket.username,
					_receiver: twoUsers.another_user
				}, {
					_sender: twoUsers.another_user,
					_receiver: socket.username
				}]
			});

			query.sort('created_at').exec(function(err, docs) {
				if (err) {
					console.log('Error 123')
					throw err;
				}
				users[socket.username].emit('load old msgs', docs);
			});
		});

		socket.on('message', function(msg) {
			console.log(msg._receiver);
			var message = new Message({
				_sender: msg._sender,
				_receiver: msg._receiver,
				text: msg.text,
				is_read: msg.is_read
			});

			message.save(function(err, response) {
				if (err) {
					console.log('Error 234')
					throw err;
				};
				users[msg._receiver].emit('message', {
					_sender: msg._sender,
					text: msg.text
				});
			});

		});
	});
}