angular.module('newJobs', [
		'ngRoute',
		'ngResource',
		'ngCookies',
		'newJobs.userProfile',
		'newJobs.job',
		'newJobs.message',
		'newJobs.adminDBoard'
	])
	.run(function($rootScope, $http, $cookieStore, $location, socket) {
		// Authentication 
		$rootScope.current_user = $cookieStore.get('user') || {};
		$rootScope.authenticated = $rootScope.current_user.username ? true : false;
		$rootScope.signOut = function() {
			$http.get('/auth/signout');
			$cookieStore.remove('user');
			$rootScope.authenticated = false;
			$rootScope.current_user = '';
			$location.path('/');
			location.reload();
		};

		//------ Message ---------
		if ($rootScope.authenticated) {
			socket.emit('new user', {
				curr_user: $rootScope.current_user.username
			});
		};

		// Connected users
		$rootScope.connUsers = [];
		$rootScope.mkUserList = function(list, unread) {
			// Prevent creating duplicate items
			if ($rootScope.connUsers.length) {
				return false;
			};
			angular.forEach(list, function(value) {
				if (unread.indexOf(value) === -1) {
					$rootScope.connUsers.push({
						name: value,
						has_msg: false
					});
				} else {
					$rootScope.connUsers.push({
						name: value,
						has_msg: true
					});
				}
			});

			if (unread && unread.length) {
				$rootScope.msgNotification = true;
			}
		};

		if ($rootScope.authenticated) {
			socket.emit('connected_users', $rootScope.current_user.username);
		};
		socket.on('connected_users', function(lists) {
			$rootScope.mkUserList(lists.userList, lists.userWNM);
			// $rootScope.myUsers = lists.userList;
		});

		$rootScope.msgNotification = false;
		$rootScope.goToMessages = function() {
			var destination;
			angular.forEach($rootScope.connUsers, function(obj) {
				if (obj.has_msg) {
					return destination = obj;
				}
			});
			if (destination) {
				$location.path('/messages/' + destination.name);
			} else {
				$location.path('/messages');
			}
			location.reload();
		};
		$rootScope.notifyUser = function(msg) {
			var is_new;
			var keepGoing = true;
			$rootScope.msgNotification = true;
			angular.forEach($rootScope.connUsers, function(value) {
				if (keepGoing) {
					if (msg._sender === value.name) {
						value.has_msg = true;
						is_new = false;
						keepGoing = false;
					} else {
						is_new = true;
					};
				};
			});
			console.log(is_new);
			if (is_new) {
				$rootScope.connUsers.push({
					name: msg._sender,
					has_msg: true
				});
				console.log("new user")
			}
		};

		socket.on('message', function(message) {
			$rootScope.notifyUser(message);
		});


		// -------- Loading--------
		$rootScope.loading = false;
		$rootScope.loadText = '';
	})
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'main.html',
				controller: 'mainController'
			})
			.when('/login', {
				templateUrl: 'login.html',
				controller: 'authController'
			})
			.when('/register', {
				templateUrl: 'register.html',
				controller: 'authController'
			})
			.otherwise({
				redirectTo: '/'
			})
	}])
	.controller('authController', function($scope, $http, $location, $rootScope, $cookieStore, socket) {
		$scope.user = {};

		$scope.login = function() {
			$http.post('/auth/login', $scope.user).success(function(response) {
				if (response.state === 'success') {
					$rootScope.authenticated = true;
					$rootScope.current_user = response.user;

					$cookieStore.put('user', $rootScope.current_user);
					$location.path('/');
					location.reload();
				} else {
					$scope.error_message = response.message;
				}
			});
		};
		$scope.register = function() {
			$http.post('/auth/signup', $scope.user).success(function(response) {
				if (response.state === 'success') {
					$rootScope.authenticated = true;
					$rootScope.current_user = response.user;
					$location.path('/');
				} else {
					$scope.error_message = response.message;
				}
			});
		}
	})
	.factory('jobService', function($resource) {
		return $resource('/api/jobs/:id');
	})
	.controller('mainController', function($scope, $http, jobService, $rootScope) {
		$scope.jobs = jobService.query();
		$scope.newJob = {};

		$scope.createJob = function(job) {
			jobService.save(job, function(res) {
				job._author = $rootScope.current_user.username;
				$scope.jobs = jobService.query();
				console.log(res);
				$scope.newJob = {}
			});
		}
	});