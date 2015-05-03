angular.module('app')
.factory('SessionService', ['$http', function($http) {
	return {
		getPendingInvites : function() {
			return $http.get('/sessions/pendingInvites');
		},

		getActiveSessions : function() {
			return $http.get('/sessions/activeSessions');
		},

		getCreatedSessions : function() {
			return $http.get('/sessions/createdSessions');
		},

		getSession : function(sessionID) {
			return $http.get('/sessions/' + sessionId);
		},

		newSession : function(title, description, invitedParticipants) {
			return $http.post('/sessions/newSession', 
				{ title : title, 
				  description : description,
				  invited_participants : invitedParticipants 
				});
		},

		inviteByEmail : function(email) {
			return $http.post('/sessions/newSession/invite',
			{
				email : email
			});
		},

		getSessionById : function(id) {
			return $http.get('/sessions/getSession/' + id);
		}
	}
}])