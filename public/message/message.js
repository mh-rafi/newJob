angular.module('newJobs.message', ['ngRoute', 'ngResource'])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/messages', {
				templateUrl: 'message/message.html',
				controller: 'messageController'
			})
			.when('/messages/:id', {
				templateUrl: 'message/message.html',
				controller: 'messageController'
			})
	}])
	.factory('socket', function($rootScope) {
		var socket = io.connect();
		return {
			on: function(eventName, callback) {
				socket.on(eventName, function() {
					var args = arguments;
					// console.log(args);
					$rootScope.$apply(function() {
						callback.apply(socket, args);
					});
				});
			},
			emit: function(eventName, data, callback) {
				socket.emit(eventName, data, function() {
					var args = arguments;
					$rootScope.$apply(function() {
						if (callback) {
							callback.apply(socket, args);
						}
					});
				})
			}
		};
	})
	.controller('messageController', function($scope, $rootScope, $routeParams, $location, socket) {
		if ($routeParams.id === $rootScope.current_user.username || !$rootScope.authenticated) {
			return $location.path('/');
		}
		socket.on('error', function(data) {
			$scope.err_msg = data.msg;
		});

		// set socket for current user
		if ($routeParams.id) {
			socket.emit('new user', {
				curr_user: $rootScope.current_user.username,
				another_user: $routeParams.id
			});
		}

		// Load old messages
		$scope.messages = [];
		socket.on('load old msgs', function(messages) {
			$scope.messages = messages;
		});

		$scope.message = {
			_sender: $rootScope.current_user.username,
			_receiver: $routeParams.id,
			is_read: false
		};

		$scope.sendMessage = function() {
			$scope.messages.push({
				_sender: $rootScope.current_user.username,
				created_at: Date.now(),
				text: $scope.message.text
			});

			socket.emit('message', $scope.message);
			$scope.message.text = '';
		};

		socket.on('message', function(message) {
			if (message._sender === $routeProvider.id) {
				message.created_at = Date.now();
				$scope.messages.push(message);
			}
		});

		// Connected users
		socket.emit('connected_users', $rootScope.current_user.username);
		socket.on('connected_users', function(list) {
			$scope.connected_users = list;
		});
	})