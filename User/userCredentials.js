var crypto = require('crypto');
//errorhandler
var handle = require('../ErrorHandler/errorHandler');
var User = require('../DB/Models/userModel');

var SALT_BYTES = 256;
var NO_ITERATIONS = 1;
var KEY_LEN = 256;
var DIGEST = 'sha256';

function generatePasswordHash (password, callback) {
	var salt = generateSalt();
	crypto.pbkdf2(password, salt, NO_ITERATIONS, KEY_LEN, DIGEST, function(err, key) {
		if(err) return callback(err);
		process.nextTick(function() {
			return callback(null, key.toString('hex'), salt);
		});
	});
};

function validateUserPassword(password, salt, callback) {
	crypto.pbkdf2(password, salt, NO_ITERATIONS, KEY_LEN, DIGEST, function(err, key) {
		if(err) return callback(err);
		process.nextTick(function() {
			return callback(null, key.toString('hex'));
		});
	});
}

function generateSalt() {
	var buf;
	try {
		buf = crypto.randomBytes(256);
		return buf.toString('hex');
	} catch(err) {
		return handle(err);
	}
}

module.exports.createUserSession = function(user, req) {
	// req.session.user = req.session.user || {};
	
	// req.session.user.logout = req.session.logout || 
	// 	function() {
	// 		delete req.session.user;
	// 	};


	// req.session.user.email = user.email;
	// req.session.user.name = user.name;
	// req.session.user.region = user.region;
	// req.session.user.public_key = user.public_key || '';
}


module.exports.validateUser = function (password, user, callback) {
	validateUserPassword(password, user.salt, function(err, hash) {
		if(err) return handle(err);
		if(user.password === hash) return callback(true);
		
		return callback(false);
	});
};

module.exports.ensureAuthenticated = function (req, res, next) {
	if(req.user !== null || req.user !== undefined) {
		next();
	} else {
		res.redirect('/login');
	}
}


module.exports.generatePasswordHash = generatePasswordHash;