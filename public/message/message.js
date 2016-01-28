angular.module('newJobs.message', ['ngRoute', 'ngResource'])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/messages', {
				templateUrl: 'message/connected-users.html',
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
		$scope.receiver = $routeParams.id;
		// $scope.active_class = 
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
			is_read: false,
			text: ''
		};

		$scope.sendMessage = function() {
			if (!$routeParams.id || !$scope.message._receiver || !$scope.message.text.trim().length) {
				return false;
			};

			$scope.messages.push({
				_sender: $rootScope.current_user.username,
				created_at: Date.now(),
				text: $scope.message.text.trim()
			});

			socket.emit('message', $scope.message);
			$scope.message.text = '';
		};

		socket.on('message', function(message) {
			if (message._sender === $routeParams.id) {
				message.created_at = Date.now();
				$scope.messages.push(message);
			}
		});

		$rootScope.clrNotification = function() {
			angular.forEach($rootScope.connUsers, function(obj) {
				if (obj.name === $routeParams.id && obj.has_msg) {
					socket.emit('clr_notfic', {
						curr_user: $rootScope.current_user.username,
						another_user: obj.name
					});

					obj.has_msg = false;
				}
			});
		}
	})