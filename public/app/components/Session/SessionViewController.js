angular.module('app')
.controller('SessionViewController', ['$rootScope', '$scope', '$window', '$routeParams', 'SessionService', function($rootScope, $scope, $window, $routeParams, SessionService) {
	var worker;
	var id = $routeParams.id;
	var status;
	var encrypt;
	var decrypt;
	$scope.session = {};
	$scope.subnav = {
		description : true,
		instructions : false,
		participants : false
	}
	$scope.status = {};
	SessionService.getSessionById(id).success(function(data, status)  {
		if(data.created_by === $window.sessionStorage.email) {
			$scope.isCreator = true;
			//creator stuff
			if(data.status.code !== 1) {
				$scope.canStart = false;
				$scope.notReadyErrorMessage = 'There are too few accepted participants to begin.';
			} else {
				$scope.canStart = true;
			}
		} else {
			$scope.isCreator = false;
			data.pending_invited_participants.forEach(function(invite) {
				console.log(invite === $window.sessionStorage.email);
				if(invite === $window.sessionStorage.email) $scope.isInvited = true;
			});
		}
		$scope.session = data;
		$scope.instructions = data.instructions;
		$scope.participants = data.invited_participants;
		$scope.status[data.status.code] = true;
		console.log($scope.status);
		console.log($window.sessionStorage.email, data.current_user);
		$scope.isNextUser = $window.sessionStorage.email === data.current_user;
		$scope.current_data = data.current_data;
		console.log($scope.session);
	}).error(function(data, status) {
		console.log(data, status)
	});

	$scope.showDescription = function() {
		$scope.subnav.instructions = $scope.subnav.participants = false;
		$scope.subnav.description = true;
	}

	$scope.showInstructions = function() {
		$scope.subnav.description = $scope.subnav.participants = false;
		$scope.subnav.instructions = true;
	}

	$scope.showParticipants = function() {
		$scope.subnav.instructions = $scope.subnav.description = false;
		$scope.subnav.participants = true;
	}
	$scope.acceptInvite = function() {
		SessionService.acceptInvite(id).success(function(data, status) {
			console.log('accepted invite');
		}).error(function(data, status) {
			console.log(data, status);
		});
	}

	$scope.startSession = function() {
		console.log('started');
		SessionService.startSession(id).success(function(data, status) {
			console.log('Session Started');
		}).error(function(data, status) {
			console.log(data, status);
		});
	}

	$scope.sendInvite = function(email) {
		SessionService.sendInvite(email, id).success(function(data, status) {

		}).error(function(data, status) {

		});
	}

	$scope.submitData = function(data) {
		var submittedData = data.split('\n');
		var decryptedData;
		if(typeof Worker !== 'undefined') {
			worker = new Worker('./vendor/nodersabuffer.js');

			worker.onmessage = function(event) {
				SessionService.submitData(event.data, id).success(function(data, status) {
					console.log(status, 'Submitted data');
					worker.terminate();
				});
			}
			SessionService.getNextPublicKey(id).success(function(data, status) {
				worker.postMessage({
					submitData : true,
					public : data,
					secret : localStorage.getItem($window.sessionStorage.email + '_private_key'),
					current_data : $scope.current_data,
					submitted_data : submittedData
				});
			});
		}
	}
}]);