//errorhandler
var handle = require('../ErrorHandler/errorHandler');
var User = require('../Models/userModel');
var Session = require('../Models/sessionModel');
var genotypes = require('../Data/genotypes');


module.exports.getAllSessions = function(req, res) {

};

module.exports.newSession = function(req, res) {
	var sessionFields = req.body;
	var session;
	var randomData;

	randomData = genotypes.generateRandomData();

	session = new Session({
		title : sessionFields.title,
		description : sessionFields.description,
		random_data : randomData,
		invited_participants : sessionFields.invited_participants
	});

	session.save(function(err) {
		if(err) return handle(err);
		res.sendStatus(200);
	});
};

module.exports.getPendingInvites = function(req, res) {

}

module.exports.getActiveSessions = function(req, res) {

}

module.exports.getCreatedSessions = function(req, res) {

}

module.exports.invite = function(req, res) {
	var fields = req.body;

	User.findOne({ email : fields.email }, function(err, user) {
		if(err) return handle(err);
		if(user) {
			res.sendStatus(200);
		} else {
			res.sendStatus(400);
		}
	})
}