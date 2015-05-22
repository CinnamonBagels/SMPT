angular.module('app')
.controller('SessionController', ['$scope', 'SessionService', '$location', '$window', function($scope, SessionService, $location, $window) {
	var session = {};
	var emails = [];
	var ownEmail = $window.sessionStorage.email;
	$scope.invites = [];
	$scope.checkbox = {};
	$scope.session = {};
	$scope.session.randomData = {};
	$scope.session.randomData.data = '';
	$scope.checkbox.includeSelf = true;
	$scope.checkbox.autoGenerate = true;

	SessionService.getPendingInvites().success(function(invites, status) {
		//console.log(invites);
		$scope.pendingInvites = invites;
	});

	SessionService.getActiveSessions().success(function(activeSessions, status) {
		//console.log(activeSessions);
		$scope.activeSessions = activeSessions;
	});

	SessionService.getCreatedSessions().success(function(createdSessions, status) {
		//console.log(createdSessions);
		$scope.createdSessions = createdSessions;
	});

	$scope.newSession = function(session) {
		var worker;
		var data;
		var invites = $scope.invites;
		var randomData = $scope.session.randomData.data.split('\n');
		var entries = $scope.session.randomData.entries;
		var generateData = $scope.checkbox.generateData;
		var includeSelf = $scope.checkbox.includeSelf;
		session.emails = emails;
		session.instructions = $scope.session.instructions;
		session.description = $scope.session.description;
		session.title = $scope.session.title;

		if($scope.checkbox.includeSelf) session.emails.push(ownEmail);
		
		///error checking
		if(isNaN(Number(entries))) return;
		if(session.emails.length < 3) return;
		if(generateData) data = generateRandomData(entries);
		else data = randomData;

		SessionService.getOwnPublic().success(function(data, status) {
			worker = new Worker('./vendor/nodersabuffer.js');

			worker.onmessage = function(e) {
				session.randomData = e.data;
				SessionService.newSession(session, includeSelf).success(function(data, status) {
					console.log(data, status);
					worker.terminate();
					$location.path('/sessions/view/' + data.session_id);
				});
			}
			worker.postMessage({
				newSession : true,
				public : data,
				randomData : JSON.stringify(data)
			});
		});
	}

	function generateRandomData(entries) {
		var data = [];
		for(var i = 0; i < entries; i += 1) {
			rand = Math.floor(Math.random() * 32 * 34 * 78 * 1000);
			data.push(rand);
		}

		return data;
	} 

	$scope.inviteByEmail = function(email) {
		var exists;
		if(email === ownEmail) return; //can't add yourself lel
		$scope.invites.forEach(function(invite) {
			if(invite.email === email) exists = true;
		});

		if(exists) return; //error here that there are duplicate emails

		SessionService.inviteByEmail(email).success(function(data, status) {
			console.log(data, status);
			if(status === 200) {
				$scope.invites.push({
					email : email,
					public_key : data
				});
				emails.push(email);
				$scope.email = '';
			}
		});
	}
}])