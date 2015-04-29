module.exports.validateAuthentication = function (req, res, next) {
	if(req.session.user !== null || req.session.user !== undefined) {
		next();
	} else {
		res.redirect('/login');
	}
}
