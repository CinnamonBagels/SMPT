angular.module('app', ['ngRoute', 'ngCookies', 'mm.foundation', 'mm.foundation.tpls'])
.run(['$rootScope', '$location', '$window', 'UserService', function($rootScope, $location, $window, UserService) {
	$rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
		if($window.sessionStorage.token && $window.sessionStorage.email) {
			UserService.isLoggedIn = true;
			if($location.url() === '/login') return $location.path('/home');
		}

		if(nextRoute.$$route.access && nextRoute.$$route.access.requiredLogin && !UserService.isLoggedIn) {
			event.preventDefault();
			return $location.path('/login');
		}
	})
}]);