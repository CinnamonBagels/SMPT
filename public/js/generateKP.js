var keyPairGenerator = keyPairGenerator || {}

keyPairGenerator = (function() {
	var worker;

	function generateKeyPair(callback) {

		if(typeof Worker !== 'undefined') {
			worker = new Worker('./js/bundle.js');

			worker.onmessage = function(event) {
				callback(event.data);
				terminate();
				return;
			}
		} else {
			//if they dont have keypair, manually execute.
		}
	}

	function terminate() {
		worker.terminate();
	}

	return {
		generateKeyPair : generateKeyPair
	};
})();