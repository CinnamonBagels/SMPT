angular.module('app')
.controller('LoginController', ['$scope', 'AuthService', '$rootScope', '$location', function($scope, AuthService, $rootScope, $location) {

	$scope.login = function(email, password) {
		AuthService.login(email, password).success(function(data, status) {
			console.log(data, status);
			AuthService.setCredentials(data.token);
			$location.path('/home');
		})
		.error(function(data, status) {
			AuthService.clearCredentials();
			$location.path('/login');
		});
	}
	$scope.register = function(name, email, password, region) {
		AuthService.register(name, email, password, region).success(function(data, status) {
			console.log(data, status);
			AuthService.setCredentials(email, password);
			$location.path('/home');
		})
		.error(function(data, status) {
			console.log(data, status);
		});
	}
}]);