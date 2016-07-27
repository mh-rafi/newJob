angular.module('newJobs.userProfile', ['ngRoute', 'ngResource'])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/profile', {
				templateUrl: 'profile/profile.html',
				controller: 'profileController'
			})
			.when('/profile/edit', {
				templateUrl: 'profile/edit.html',
				controller: 'profileController'
			})
			.when('/user/:username', {
				templateUrl: 'profile/user.html',
				controller: 'userController'
			})
			.when('/login', {
				templateUrl: 'profile/login.html',
				controller: 'authController'
			})
			.when('/register', {
				templateUrl: 'profile/register.html',
				controller: 'authController'
			})
			.when('/verify', {
				templateUrl: 'profile/verify.html',
				controller: 'authController'
			})
	}])
	.factory('profileService', function($resource) {
		return $resource('/api/profile/:id');
	})
	.factory('userService', function($resource) {
		return $resource('/api/user/:id');
	})
	.controller('profileController', function($scope, $rootScope, $http, $timeout, $location, jobService, profileService) {

		//---============ Update profile functionality =========---
		$scope.myProfile = profileService.get();
		$scope.career_levels = ['Starter', 'Mid level', 'Expert'],

			/*---------- SKILLS ----------*/
			$scope.addingSkill = false;
		$scope.myProfile.skills = [];
		$scope.newSkill = {};
		$scope.addSkill = function() {
			$scope.myProfile.skills.push($scope.newSkill);
			$scope.newSkill = {};
		};
		$scope.removeSkill = function(skill) {
			var index = $scope.myProfile.skills.indexOf(skill);
			$scope.myProfile.skills.splice(index, 1);
		};

		/*---------- OTHER SKILLS ----------*/
		$scope.myProfile.other_skills = [];
		$scope.otherSkill = {};
		$scope.addOtherSkill = function() {
			$scope.myProfile.other_skills.push($scope.otherSkill);
			$scope.otherSkill = {};
		};
		$scope.removeOtherSkill = function(skill) {
			var index = $scope.myProfile.other_skills.indexOf(skill);
			$scope.myProfile.other_skills.splice(index, 1);
		};

		/*--------- SOCIAL ACCOUNTS ---------*/
		$scope.myProfile.social_accounts = [{
			name: 'facebook'
		}, {
			name: 'twitter'
		}, {
			name: 'google'
		}];
		// $scope.soc_accounts = [{name: 'facebook'}, {name: 'twitter'}, {name: 'google'}]

		$scope.updateProfile = function() {
			$rootScope.loading = true;
			$rootScope.loadText = 'Updating profile...';
			$http.put('/api/profile', $scope.myProfile).then(function(res) {
				$rootScope.loadText = 'Success!';
				$timeout(function() {
					$rootScope.loading = false;
					$rootScope.loadText = 'Loading..';
					$location.path('/profile');
				}, 1500);
			}).catch(function() {
				$rootScope.loadText = 'Unable to update profile!';
				$timeout(function() {
					$rootScope.loading = false;
					$rootScope.loadText = 'Loading..';
				}, 1500);
			});
		};

		//------=======my jobs======--------
		$scope.myJobs = jobService.query({
			username: $rootScope.current_user.username
		});

		$scope.deleteJob = function(jobId) {
			jobService.delete({
				id: jobId
			}, function(resp) {
				console.log(resp.message);

				$scope.myJobs = jobService.query({
					username: $rootScope.current_user.username
				});
			});
		}
	})

// public profile
.controller('userController', function($scope, $routeParams, userService, jobService) {
		$scope.user = userService.get({
			id: $routeParams.username
		}, function(err) {
			console.log(err)
		});

		// user jobs
		$scope.userJobs = jobService.query({
			username: $routeParams.username
		});
	})
	.controller('authController', function($scope, $http, $location, $rootScope, $cookieStore, socket) {
		if ($location.path() === '/verify') {
			var user_data = $location.search();

			$http.get('/auth/verify/?email=' + user_data.email + '&key=' + user_data.key).then(function(response) {
				$scope.success_message = response.data.message;
			}, function(response) {
				$scope.error_message = response.data.message;
			});
		};

		$scope.user = {};
		$scope.newUser = {};

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
			$http.post('/auth/signup', $scope.newUser).then(function(response) {

				// $rootScope.authenticated = true;
				// $rootScope.current_user = response.user;
				// $location.path('/');
				$scope.success_message = response.data.message;

			}, function(response) {
				$scope.error_message = response.data.message;
			});
		}
		$scope.savePassword = function() {
			console.log('----- 1 ----');
			if($scope.newUser.password !== $scope.newUser.repassword) {
				return $scope.error_message = 'Password does not match' ;
			};
			if($scope.newUser.password === '' || $scope.newUser.repassword === '') {
				return $scope.error_message = 'Password field is empty' ;
			};
			$scope.error_message = '';

			$scope.newUser.email = user_data.email;
			$scope.newUser.key = user_data.key;
			$http.post('/auth/setpassword', $scope.newUser).then(function(response) {
				$scope.newUser = {};
				$scope.success_message = response.data.message;
			}, function(response) {
				console.log(response);
				$scope.error_message = response.data.message;
			});
			console.log($scope.newUser);
		}

		
	});