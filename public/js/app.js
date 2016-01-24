angular.module('newJobs', [
		'ngRoute',
		'ngResource',
		'ngCookies',
		'newJobs.userProfile',
		'newJobs.job',
		'newJobs.message'
	])
	.run(function($rootScope, $http, $cookieStore, $location) {
		// Authentication 
		$rootScope.current_user = $cookieStore.get('user') || {};
		$rootScope.authenticated = $rootScope.current_user.username ? true : false;
		//console.log($cookieStore.get('user'));
		$rootScope.signOut = function() {
			$http.get('/auth/signout');
			$cookieStore.remove('user');
			$rootScope.authenticated = false;
			$rootScope.current_user = '';
			$location.path('/');
		};

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
	.controller('authController', function($scope, $http, $location, $rootScope, $cookieStore) {
		$scope.user = {};

		$scope.login = function() {
			$http.post('/auth/login', $scope.user).success(function(response) {
				if (response.state === 'success') {
					$rootScope.authenticated = true;
					$rootScope.current_user = response.user;

					$cookieStore.put('user', $rootScope.current_user);
					$location.path('/');
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