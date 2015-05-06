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

		newSession : function(session, includeSelf) {
			return $http.post('/sessions/newSession', 
				{ title : session.title, 
				  description : session.description,
				  invited_participants : session.emails,
				  includeSelf : includeSelf
				});
		},

		inviteByEmail : function(email) {
			return $http.post('/sessions/newSession/invite',
			{
				email : email
			});
		},

		getSessionById : function(id) {
			return $http.get('/sessions/get/' + id);
		},

		acceptInvite : function(id) {
			return $http.post('/sessions/' + id + '/accept');
		},

		startSession : function(id) {
			return $http.post('/sessions/' + id + '/start')
		},

		sendInvite : function(email, id) {
			return $http.post('/sessions/' + id + '/sendInvite', {
				email : email
			})
		},

		submitData : function(data, id) {
			return $http.post('/sessions/' + id + '/submitData', {
				data : data
			});
		}
		getNextPublicKey : function(id) {
			return $http.get('/sessions/' + id + '/getPublicKey');
		}
	}
}])