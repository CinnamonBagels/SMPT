module.exports.validateAuthentication = function (req, res, next) {
	if(req.user !== null || req.user !== undefined) {
		next();
	} else {
		res.redirect('/login');
	}
}
