angular.module('app')
.controller('SessionModalController', ['$scope', '$modalInstance', 
function($scope, $modalInstance) {
	var parentScope = $scope.$parent;
	$scope.checkPublicKeyValidation = false;
	$scope.publicKeyValid;
	console.log($scope);
	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	}

	$scope.terminate = function() {
		$modalInstance.close('terminate');
	}

	$scope.destroy = function() {
		$modalInstance.close('destroy')
	}

	$scope.acceptInvite = function() {

	}

	$scope.declineInvite = function() {

	}

	$scope.validatePublicKey = function(publicKey) {
		$scope.publicKeyValid = parentScope.ownPublic === publicKey
		$scope.checkValidation = true;
	}
}]);