angular.module('app')
.factory('AuthInterceptor', ['$rootScope', '$q', '$window', '$location', 'UserService', function($rootScope, $q, $window, $location, UserService) {
	return {
		request : function(config) {
			config.headers = config.headers || {};
			//console.log(config);
			if($window.sessionStorage.token) {
				config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
			}

			return config;
		},

		requestError : function(rejection) {
			//console.log(rejection);
			return $q.reject(rejection);
		},

		response : function(response) {
			//console.log(response);
			if(response != null && response.status === 200 && $window.sessionStorage.token && !UserService.isLoggedIn)
				UserService.isLoggedIn = true;


			return response || $q.when(response);
		},

		responseError : function(rejection) {
			//console.log(rejection);
			if (rejection != null && rejection.status === 401 && ($window.sessionStorage.token || UserService.isLoggedIn)) {
	            delete $window.sessionStorage.token;
	            UserService.isLoggedIn = false;
	            return $location.path("/");
	        }
			return $q.reject(rejection);
		}
	}
}]);