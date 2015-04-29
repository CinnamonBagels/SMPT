//errorhandler
var handle = require('../ErrorHandler/errorHandler');
var userLogic = require('../User/user.js');
var User = require('../Models/userModel');

module.exports.postRegister = function(req, res) {
	var registerField = req.body;
	console.log(registerField);

	User.findOrCreate({
		email : registerField.email
	},
	function(err, user, created) {
		if(err) return handle(err, '/register');

		if(created) {
			userLogic.generatePasswordHash(registerField.password, function(err, hash, salt) {
				if(err) return handle(err);
				user.name = registerField.name;
				user.password = hash;
				user.salt = salt;
				user.region = registerField.region;
				user.save();

				res.sendStatus(200);
			});
		} else {
			res.sendStatus(400);
		}
	});
};

module.exports.postLogin = function(req, res) {
	var loginField = req.body;

	User.findOne({ email : loginField.email }, function(err, user) {
		if(err) return handle(err);
		if(user) {
			userLogic.validateUser(loginField.password, user, function(valid) {
				if(err) return handle(err);
				if(valid) {
					userLogic.createUserSession(user, req);
					res.sendStatus(200);
				}
				else res.sendStatus(400);
			});
		} else {
			res.sendStatus(400);
		}
	});
	//res.send('wtf');
};

module.exports.postLogout = function(req, res) {
	if(req.user) {
		req.session.user.logout();
	}

	res.redirect('/');
};

module.exports.storePublicKey = function(req, res) {
	var fields = req.body;
	User.findOne({ email : req.session.user.email }, function(err, user) {
		if(err) return handle(err);
		if(user) {
			user.public_key = fields.publicKey;
			user.save();
			res.sendStatus(200);
		} else {
			res.sendStatus(400);
		}
	});
}