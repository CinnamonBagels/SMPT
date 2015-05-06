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
		console.log($scope.status);
		console.log($window.sessionStorage.email, data.current_user);
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
		var combinedData = {};
		var caseData;
		var controlData;
		var i;
		if(typeof Worker !== 'undefined') {
			worker = new Worker('./vendor/nodersabuffer.js');
			worker.onmessage = function(event) {
				sections = event.data.split(' ENDSECTION ');

				//will be sent encrypted, data
				if(sections[0] === 'encrypted') {
					SessionService.submitData(sections[1], id).success(function(data, status) {
						console.log(status, 'Submitted data');
						worker.terminate();
					});
				} 

				//worker sends decrypted, json data via string format
				if(sections[0] === 'decrypted') {
					console.log('works fine');
					decryptedData = JSON.parse(sections[1]);
					console.log('works fine');
					//console.log(decryptedData);
					i = 0;
					caseData = decryptedData.case.map(function(element) {
						console.log(element + submittedData[i], submittedData[i], element);
						return Number(element) + Number(submittedData[i++]);
					});

					controlData = decryptedData.control.map(function(element) {
						return Number(element) + Number(submittedData[i++]);
					});

					combinedData.case = caseData;
					combinedData.control = controlData;
					/*
					HERE we have to combine the data.
					 */
					console.log(combinedData);
					//now we encrypt with the public key of next person
					SessionService.getNextPublicKey(id).success(function(data, status) {
						console.log('got public key: ', data);
						worker.postMessage(['encrypt',
							'ENDSECTION',
							JSON.stringify(combinedData),
							'ENDSECTION',
							data
						].join(' '));
					})
				}
			}
			worker.postMessage([
				'decrypt', 
				'ENDSECTION', 
				$scope.current_data, 
				'ENDSECTION', 
				localStorage.getItem($window.sessionStorage.email + '_private_key')
			].join(' '));
		}
	}
}]);