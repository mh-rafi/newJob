angular.module('newJobs.adminDBoard', ['ngRoute', 'ngResource'])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/dashboard', {
				templateUrl: 'admin/main.html',
				controller: 'adminController'
			});
	}])
	.directive('ngConfirmClick', [
		function() {
			return {
				link: function(scope, element, attr) {
					var msg = attr.ngConfirmClick || "Are you sure?";
					var clickAction = attr.confirmedClick;
					element.bind('click', function(event) {
						if (window.confirm(msg)) {
							scope.$eval(clickAction)
						}
					});
				}
			};
		}
	])
	.controller('adminController', function($scope, $rootScope, userService, $http) {
		$scope.users = userService.query();

		$scope.removeUser = function(user) {
			var test = userService.delete({
				id: user.username
			}, function(err) {
				$scope.users = userService.query();
			});
		}

	})