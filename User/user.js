var crypto = require('crypto');
//errorhandler
var handle = require('../ErrorHandler/errorHandler');

var SALT_BYTES = 256;
var NO_ITERATIONS = 1;
var KEY_LEN = 256;
var DIGEST = 'sha256';

function generateSalt() {
	var buf;
	try {
		buf = crypto.randomBytes(256);
		return buf.toString('hex');
	} catch(err) {
		return handle(err);
	}
}

function createUserSession(user, req) {
	req.logout = req.logout || 
		function() {
			if(req.user) delete req.user;
		};

	req.user = req.user || {};

	req.user.email = user.email;
	req.user.name = user.name;
	req.user.region = user.region;
	req.user.public_key = user.public_key || '';
}

module.exports.generatePasswordHash = function (password, callback) {
	var salt = generateSalt();
	crypto.pbkdf2(password, salt, NO_ITERATIONS, KEY_LEN, DIGEST, function(err, key) {
		if(err) return callback(err);
		process.nextTick(function() {
			return callback(null, key.toString('hex'));
		});
	});
};

module.exports.validateUser = function (password, user, req, res) {
	generatePasswordHash(password, user.salt, function(err, hash) {
		if(err) return handle(err);

		if(user.password === hash) {
			user = createUserSession(user);
			res.redirect('/account');
		} else {
			res.redirect('/login');
		}
	});
};
