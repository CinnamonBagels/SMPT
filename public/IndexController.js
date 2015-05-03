angular.module('app')
.controller('IndexController', ['$scope', '$rootScope', 'AuthService', function($scope, $rootScope, AuthService) {
	$scope.logout = function() {
		AuthService.logout().success(function(data, status) {
			console.log(data, status);
			AuthService.clearCredentials();
		})
		.error(function(data, status) {

		});
	}

	$scope.isLoggedIn = function() {
		return AuthService.isLoggedIn();
	}

}]);