angular.module('app')
.controller('AccountController', ['$scope', '$window', 'AccountService', function($scope, $window, AccountService) {
	$scope.createKeypair = function() {
		AccountService.createKeypair();
	}
}]);