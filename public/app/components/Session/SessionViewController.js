angular.module('app')
.controller('SessionViewController', ['$rootScope', '$scope', '$window', '$routeParams', 'SessionService', '$modal', 
function($rootScope, $scope, $window, $routeParams, SessionService, $modal) {
	var worker;
	var id = $routeParams.id;
	var status;
	var encrypt;
	var decrypt;
	var ownPublic = localStorage.getItem($window.sessionStorage.email + '_public_key');
	console.log(ownPublic)
	$scope.session = {};
	$scope.subnav = {
		description : true,
		instructions : false,
		participants : false
	}
	$scope.status = {};

	function notReady() {
		$scope.canStart = false;
		$scope.sessionStatus = 'Cannot Start';
		$scope.status = { '0' : true };
	}

	function start() {
		$scope.canStart = true;
		$scope.sessionStatus = 'Start Session';
		$scope.status = { '1' : true };
	}

	function active() {
		$scope.canStart = false;
		$scope.sessionStatus = 'Already Active';
		$scope.status = { '2' : true };
	}

	function completed() {
		$scope.canStart = false;
		$scope.sessionStatus = 'Completed';
		$scope.status = { '3' : true };
	}
	SessionService.getSessionById(id).success(function(data, status)  {
		if(data.created_by === $window.sessionStorage.email) {
			//0 not ready
			//1 ready
			//2 active
			//3 complete
			$scope.isCreator = true;
			//creator stuff

			//decrypt the current_data and random data, subtract the random data from the current data, then 
			//display.
			if(data.status.code === 3) {
				worker = new Worker('./vendor/nodersabuffer.js');

				worker.onmessage = function(message) {
					if(message.data === 'error') {
						return $scope.aggregateData = ['You cannot access this data anymore.']
					}

					$scope.aggregateData = message.data;
				}

				worker.postMessage({
					secret : localStorage.getItem($window.sessionStorage.email + '_private_key'),
					randomData : data.random_data,
					currentData : data.current_data,
					finalData : true
				});
			}
		} else {
			$scope.isCreator = false;
			data.pending_invited_participants.forEach(function(invite) {
				console.log(invite === $window.sessionStorage.email);
				if(invite === $window.sessionStorage.email) $scope.isInvited = true;
			});
		}
		switch(data.status.code) {
			case 0 :
				notReady();
				break;
			case 1 :
				start();
				break;
			case 2 :
				active();
				break;
			case 3 : 
				completed();
		}
		$scope.session = data;
		$scope.instructions = data.instructions;
		$scope.participants = data.invited_participants;
		console.log($scope.status);
		console.log($window.sessionStorage.email, data.current_user);
		$scope.isNextUser = $window.sessionStorage.email === data.current_user;
		$scope.current_data = data.current_data;
		console.log($scope.session);
	}).error(function(data, status) {
		console.log(data, status)
	});

	$scope.openSessionModal = function(type) {
		var modalInstance = $modal.open({
			templateUrl : type,
			controller : 'SessionModalController',
			windowClass : 'reveal-modal fade',
			scope : $scope
		});

		modalInstance.result.then(function(choice) {
			if(choice === 'terminate') {
				console.log('terminate');
			} else if(choice === 'destroy') {
				console.log('destroy');
			}
		});
	}

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
			$scope.accepted = true;
		}).error(function(data, status) {
			console.log(data, status);
		});
	}

	$scope.startSession = function() {
		console.log('started');
		SessionService.startSession(id).success(function(data, status) {
			console.log('Session Started');
			active();
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