angular.module('app')
.controller('AccountController', ['$scope', '$window', 'AccountService', function($scope, $window, AccountService) {
	$scope.keypair = {};
	$scope.keypair.hasKey = false;
	$scope.generatingKeypair = false;
	$scope.keypairProgress = '0%';
	if(localStorage.getItem('private_key')) $scope.keypair.hasKey = true;

	var spinnerVisible = false;
	function showProgress() {
	    if (!spinnerVisible) {
	        $("div#spinner").fadeIn("fast");
	        spinnerVisible = true;
	    }
	}
	function hideProgress() {
	    if (spinnerVisible) {
	        var spinner = $("div#spinner");
	        spinner.stop();
	        spinner.fadeOut("fast");
	        spinnerVisible = false;
	    }
	}

	$scope.createKeypair = function() {
		showProgress();
		AccountService.createKeypair(function() {
			$scope.keypairProgress = '100%';
			$scope.keypair.keypair_status = 'Created Keypair!';
			hideProgress();
		});
		
	}
}]);