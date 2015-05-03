angular.module('app')
.controller('SessionController', ['$scope', 'SessionService', function($scope, SessionService) {

	$scope.emails = [];

	SessionService.getPendingInvites().success(function(invites, status) {
		console.log(invites);
		$scope.pendingInvites = invites;
	});

	SessionService.getActiveSessions().success(function(activeSessions, status) {
		console.log(activeSessions);
		$scope.activeSessions = activeSessions;
	});

	SessionService.getCreatedSessions().success(function(createdSessions, status) {
		console.log(createdSessions);
		$scope.createdSessions = createdSessions;
	});

	$scope.newSession = function(title, description) {
		SessionService.newSession(title, description, $scope.emails).success(function(data, status) {
			
			console.log(data, status);
		});
	}

	$scope.inviteByEmail = function(email) {
		console.log(email);
		SessionService.inviteByEmail(email).success(function(data, status) {
			console.log(data, status);
			if(status === 200) $scope.emails.push(email);
		});
	}
}])