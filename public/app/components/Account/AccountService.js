angular.module('app')
.factory('AccountService', ['$http', '$window', function($http, $window) {
	var worker;
	var keypair;
	var ctrlScope;

	function generateKeyPair(callback) {
		if(typeof Worker !== 'undefined') {
			ctrlScope.keypairProgress = '75%';
			worker = new Worker('./assets/js/bundle.js');
			worker.onmessage = function(event) {
				return callback(event.data);
			}
		} else {
			//if they dont have keypair, manually execute.
		}
	}

	function terminateWorker() {
		worker.terminate();
	}

	function sendKey(publicKey) {
		$http.post('/account/publickey',
		{
			publicKey : publicKey
		}).success(function(data, status) {
			console.log(data, status);
		});
	}

	return {
		createKeypair : function(scope, callback) {
			ctrlScope = scope;
			if(typeof localStorage !== 'undefined') {
				generateKeyPair(function(keypair) {
					localStorage.setItem($window.sessionStorage.email + '_private_key', keypair.private);
					sendKey(keypair.public);
					callback();
				});
			} else {
				//you have no local storage, please use a browser that has local storage.
			}
		}
	}
}]);