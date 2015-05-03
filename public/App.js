angular.module('app', ['ngRoute', 'ngCookies'])
.run(['$rootScope', '$location', 'UserService', function($rootScope, $location, UserService) {
	$rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
		console.log(nextRoute);
		if(!nextRoute) {
			$location.path('/');
		}
		if(nextRoute && nextRoute.access.requiredLogin && !UserService.isLoggedIn) {
			event.preventDefault();
			$location.path('/');
		}
	})
}]);