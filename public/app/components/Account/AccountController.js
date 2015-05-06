angular.module('app')
.controller('AccountController', ['$scope', '$window', 'AccountService', function($scope, $window, AccountService) {
	$scope.keypair = {};
	$scope.hasKey = false;
	if(localStorage.getItem('private_key')) $scope.hasKey = true;
	$scope.createKeypair = function() {
		AccountService.createKeypair(function() {
			$scope.keypair.keypair_status = 'Created Keypair!';
		});
	}
}]);