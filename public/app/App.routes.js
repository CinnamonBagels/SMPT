angular.module('app')
.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {
	$routeProvider
		.when('/', {
			templateUrl : 'app/components/User/login.html',
			controller : 'LoginController'
		})
		.when('/sessions', {
			templateUrl : 'app/components/Session/sessions.html',
			controller : 'SessionController'
		})
		.when('/sessions/new', {
			templateUrl : 'app/components/Session/newSession.html',
			controller : 'SessionController'
		})
		.when('/home', {
			templateUrl : 'app/components/Account/account.html',
			controller : 'AccountController'
		})
		.otherwise({
			redirectTo : '/'
		});
	$locationProvider.html5Mode({
		enabled : true,
		requireBase : false
	});

	$httpProvider.interceptors.push('AuthInterceptor');
}]);