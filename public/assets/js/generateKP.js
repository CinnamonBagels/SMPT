var keyPairGenerator = keyPairGenerator || {}

keyPairGenerator = (function() {
	var worker;

	function generateKeyPair(callback) {

		if(typeof Worker !== 'undefined') {
			worker = new Worker('./assets/js/bundle.js');

			worker.onmessage = function(event) {
				callback(event.data);
				return terminate();
				
			}
		} else {
			//if they dont have keypair, manually execute.
		}
	}

	function terminate() {
		
	}

	return {
		generateKeyPair : generateKeyPair
	};
})();