angular.module('app')
.controller('SessionController', ['$scope', 'SessionService', '$location', '$window', function($scope, SessionService, $location, $window) {

	$scope.emails = [];
	$scope.checkbox = {};
	$scope.checkbox.includeSelf = true;

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
		session.emails = $scope.emails;
		if($scope.checkbox.includeSelf) session.emails.push($window.sessionStorage.email);
		SessionService.newSession(session, $scope.checkbox.includeSelf).success(function(data, status) {
			console.log(data, status);
			$location.path('/sessions/view/' + data.session_id);
		});
	}

	$scope.inviteByEmail = function(email) {
		SessionService.inviteByEmail(email).success(function(data, status) {
			console.log(data, status);
			if(status === 200) {
				$scope.emails.push(email);
				$scope.email = '';
			}
		});
	}
}])