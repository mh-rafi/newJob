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

		//--------------Update profile functionality ----------
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
		$scope.myProfile.social_accounts = [{name: 'facebook'}, {name: 'twitter'}, {name: 'google'}];
		// $scope.soc_accounts = [{name: 'facebook'}, {name: 'twitter'}, {name: 'google'}]

		$scope.updateProfile = function() {
			$http.put('/api/profile', $scope.myProfile).then(function(res) {
				console.log(res);
			})
		};

		//------------my jobs---------------
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