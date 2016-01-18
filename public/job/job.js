angular.module('newJobs.job', ['ngRoute', 'ngResource'])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/job/:jobId', {
				templateUrl: 'job/job.html',
				controller: 'jobController'
			})
			.when('/new-job', {
				templateUrl: 'job/edit.html',
				controller: 'jobController'
			})
	}])
	.controller('jobController', function($scope, $routeParams, jobService, $http) {
		$scope.message = '';
		if ($routeParams.jobId) {
			$scope.job = jobService.get({
				id: $routeParams.jobId
			}, function(res) {
				console.log(res)
			});
		};

		$scope.applyJob = function() {
			$http.put('/api/apply/' + $routeParams.jobId).then(function(res) {
				$scope.message = res.data.message;
			}, function(res) {
				$scope.message = res.data.message;
			});
		};

		//------ Create Job fnctionality ---------------
		$scope.newJob = {};
		$scope.newJob.required_skills = [];
		$scope.newSkill = {};
		$scope.addSkill = function() {
			$scope.newJob.required_skills.push($scope.newSkill);
			$scope.newSkill = {};
		};
		$scope.removeSkill = function(skill) {
			var index = $scope.newJob.required_skills.indexOf(skill);
			$scope.newJob.required_skills.splice(index, 1);
		};



		$scope.newJob.additional_requirements = [];
		$scope.additional_req = {};
		$scope.addRequirement = function() {
			$scope.newJob.additional_requirements.push($scope.additional_req);
			$scope.additional_req = {};
		};
		$scope.removeRequirement = function(requirement) {
			var index = $scope.newJob.additional_requirements.indexOf(requirement);
			$scope.newJob.additional_requirements.splice(index, 1);
		};

		$scope.addJob = function() {
			jobService.save($scope.newJob, function(res) {
				$scope.newJob = {};
				console.log(res)
			});
		};
	})