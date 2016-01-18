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
	}])
	.factory('profileService', function($resource) {
		return $resource('/api/profile/:id');
	})
	.factory('userService', function($resource) {
		return $resource('/api/user/:id');
	})
	.controller('profileController', function($scope, $rootScope, $http, jobService, profileService) {
		$scope.myProfile = profileService.get();
		// console.log($scope.myProfile);

		$scope.addingSkill = false;
		$scope.newSkill = {};

		$scope.addSkill = function() {
			$scope.myProfile.skills.push($scope.newSkill);
			$scope.newSkill = {};
		}
		$scope.updateProfile = function() {
			$http.put('/api/profile', $scope.myProfile).then(function(res) {
				console.log(res);
			})
		};

		// my jobs
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
	});