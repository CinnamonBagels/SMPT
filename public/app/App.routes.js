angular.module('app')
.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {
	$routeProvider
		.when('/', {
			templateUrl : 'app/components/Main/main.html',
			controller : 'IndexController',
			access : { requiredLogin : false }
		})
		.when('/login', {
			templateUrl : 'app/components/User/login.html',
			controller : 'LoginController',
			access : { requiredLogin : false }
		})
		.when('/sessions', {
			templateUrl : 'app/components/Session/sessions.html',
			controller : 'SessionController',
			access : { requiredLogin : true }
		})
		.when('/sessions/new', {
			templateUrl : 'app/components/Session/newSession.html',
			controller : 'SessionController',
			access : { requiredLogin : true }
		})
		.when('/sessions/view/:id', {
			templateUrl : 'app/components/Session/viewSession.html',
			controller : 'SessionViewController',
			access : { requiredLogin : true }
		})
		.when('/home', {
			templateUrl : 'app/components/Account/account.html',
			controller : 'AccountController',
			access : { requiredLogin : true }
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