angular.module('app')
.factory('UserService', function() {
	auth = {
		isLoggedIn : false
	}

	return auth;
});