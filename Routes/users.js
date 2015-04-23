//errorhandler
var handle = require('../ErrorHandler/errorHandler');
var userLogic = require('../User/user.js');

module.exports.getRegister = function(req, res) {
};

module.exports.postRegister = function(req, res) {
	var registerField = req.body;

	User.findOrCreate({
		email : registerField.register_email
	},
	function(err, user, created) {
		if(err) return handle(err, '/register');

		if(created) {
			userLogic.generatePasswordHash(registerField.register_password, salt, function(err, hash) {
				user.name = registerField.register_name;
				user.password = hash;
				user.salt = salt;
				user.region = registerField.register_region;
				user.save();

				res.redirect('/account');
			});
		} else {
			res.redirect('/login');
		}
	});
};

module.exports.getLogin = function(req, res) {
	res.render('login');
}

module.exports.postLogin = function(req, res) {
	var loginField = req.body;

	User.findOne({ email : loginField.login_email }, function(err, user) {
		if(err) return handle(err);
		if(user) {
			userLogic.validateUser(loginField.login_password, user, req, res);
		} else {
			res.redirect('/login');
		}
	});
};