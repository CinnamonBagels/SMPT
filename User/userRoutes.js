//errorhandler
var handle = require('../ErrorHandler/errorHandler');
var userCredentials = require('./userCredentials');
var UserModel = require('../DB/Models/userModel');
var jwt = require('jsonwebtoken');

module.exports.postRegister = function(req, res) {
	var registerField = req.body;
	var token;
	var profile;
	console.log(registerField);

	UserModel.findOrCreate({
		email : registerField.email
	},
	function(err, user, created) {
		if(err) return handle(err, '/register');

		if(created) {
			userCredentials.generatePasswordHash(registerField.password, function(err, hash, salt) {
				if(err) return handle(err);
				user.name = registerField.name;
				user.password = hash;
				user.salt = salt;
				user.region = registerField.region;
				user.save(function(err) {
					if(err) return handle(err);

					profile = {
						name : user.name,
						email : user.email,
						id : user._id
					};

					token = jwt.sign(profile, 'keyboard cat');
					res.status(200);
					res.json({ token : token });
				});

			});
		} else {
			res.sendStatus(400);
		}
	});
};

module.exports.postLogin = function(req, res) {
	var loginField = req.body;
	var token;
	var profile;
	UserModel.findOne({ email : loginField.email }, function(err, user) {
		if(err) return handle(err);
		if(!user) return res.sendStatus(401);

		userCredentials.validateUser(loginField.password, user, function(valid) {
			if(err) return handle(err);
			if(!valid) return res.send(401, 'Invalid user or password');
			//userCredentials.createUserSession(user, req);
			
			profile = {
				name : user.name,
				email : user.email,
				id : user._id
			}

			token = jwt.sign(profile, 'keyboard cat');

			res.status(200);
			res.json({ token : token });
		});
	});
	//res.send('wtf');
};

module.exports.postLogout = function(req, res) {
	if(req.user) return req.user.logout();

	res.redirect('/');
};

module.exports.storePublicKey = function(req, res) {
	var fields = req.body;
	console.log(fields);
	UserModel.findOne({ email : req.user.email }, function(err, user) {
		if(err) return handle(err);
		if(user) {
			user.public_key = fields.publicKey;
			user.save(function(err) {
				if(err) return handle(err);
				res.sendStatus(200);
			});
			
		} else {
			res.sendStatus(400);
		}
	});
}