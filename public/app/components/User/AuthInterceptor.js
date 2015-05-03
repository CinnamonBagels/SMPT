angular.module('app')
.factory('AuthInterceptor', ['$rootScope', '$q', '$window', '$location', function($rootScope, $q, $window, $location) {
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
			console.log(rejection);
			return rejection;
		},

		response : function(response) {
			console.log(response);
			if(response.status === 401) {
				$location.path('/');
			}

			return response || $q.when(response);
		},

		responseError : function(rejection) {
			console.log(rejection);
			return rejection;
		}
	}
}]);