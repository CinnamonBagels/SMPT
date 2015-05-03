angular.module('app')
.controller('SessionViewController', ['$scope', '$routeParams', 'SessionService', function($scope, $routeParams, SessionService) {
	var id = $routeParams.id;
	var status;
	$scope.session = {};

	SessionService.getSessionById(id).success(function(data, status)  {
		$scope.session = data;
		console.log($scope.session);
	}).error(function(data, status) {
		console.log(data, status)
	});
}]);