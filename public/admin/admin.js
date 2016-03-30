angular.module('newJobs.adminDBoard', ['ngRoute', 'ngResource'])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/dashboard', {
				templateUrl: 'admin/main.html',
				controller: 'adminController'
			});
	}])
	.controller('adminController', function($scope, $rootScope) {
		
	})