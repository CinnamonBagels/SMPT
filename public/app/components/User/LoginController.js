angular.module('app')
.controller('LoginController', ['$scope', 'AuthService', '$rootScope', '$location', function($scope, AuthService, $rootScope, $location) {
	$scope.user = {};
	$scope.newUser = {};
	$scope.login = function(user) {
		AuthService.login(user.email, user.password).success(function(data, status) {
			console.log(data, status);
			AuthService.setCredentials(user.email, data.token);
			$location.path('/home');
		})
		.error(function(data, status) {
			AuthService.clearCredentials();
			$location.path('/login');
		});
	}
	$scope.register = function(user) {
		AuthService.register(user).success(function(data, status) {
			console.log(data, status);
			AuthService.setCredentials(user.email, data.token);
			$location.path('/home');
		})
		.error(function(data, status) {
			console.log(data, status);
		});
	}
}]);