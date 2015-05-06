angular.module('app')
.controller('SessionViewController', ['$rootScope', '$scope', '$window', '$routeParams', 'SessionService', function($rootScope, $scope, $window, $routeParams, SessionService) {
	var worker;
	var id = $routeParams.id;
	var status;
	var encrypt;
	var decrypt;
	$scope.session = {};
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
		$scope.status[data.status.code] = true;
		$scope.isNextUser = $window.sessionStorage.email === data.current_user;
		$scope.current_data = data.current_data;
		console.log($scope.session);
	}).error(function(data, status) {
		console.log(data, status)
	});

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
		var sections;
		var decryptedData;
		var combinedData;
		if(typeof Worker !== 'undefined') {
			worker = new Worker('./vendor/nodersabuffer.js');
			worker.onmessage = function(event) {
				sections = event.data.split(' ENDSECTION ');

				//will be sent encrypted, data
				if(sections[0] === 'encrypted') {
					SessionService.submitData(sections[1]).success(function(data, status) {
						
					});
				} 

				//worker sends decrypted, json data via string format
				if(sections[0] === 'decrypted') {
					decryptedData = JSON.parse(sections[1]);
					console.log(decryptedData);

					/*
					HERE we have to combine the data.
					 */
					
					//now we encrypt with the public key of next person
					SessionService.getNextPublicKey(id).success(function(data, status) {
						worker.postMessage(['encrypt',
							'ENDSECTION',
							combinedData,
							'ENDSECTION',
							data.public_key
						].join(' '));
					})
				}
			}
			worker.postMessage([
				'decrypt', 
				'ENDSECTION', 
				$scope.current_data, 
				'ENDSECTION', 
				localStorage.get('private_key')
			].join(' '));
		}
	}
}]);