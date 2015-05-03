//errorhandler
var handle = require('../ErrorHandler/errorHandler');
var UserModel = require('../DB/Models/userModel');
var SessionModel = require('../DB/Models/sessionModel');
var genotypes = require('../Data/genotypes');
var async = require('async');

module.exports.newSession = function(req, res) {
	var sessionFields = req.body;
	var randomData;

	var asyncTasks = [];
	randomData = genotypes.generateRandomData();
	SessionModel.create({
		title : sessionFields.title,
		description : sessionFields.description,
		random_data : randomData,
		invited_participants : sessionFields.invited_participants,
		created_by : req.user.email
	},
	function(err, session) {
		if(err) return handle(err);

		asyncTasks.push(function(callback) {
			UserModel.findOneAndUpdate( 
				{ email : sessionFields.invited_participants }, 
				{ $push: { pending_invites : session._id } }, 
				function(err, user) {
					if(err) return handle(err);
					console.log(user);
					callback();
			});
		});

		async.parallel(asyncTasks, function(err) {
			if(err) return handle(err);
			res.sendStatus(200);
		})
	});
};

module.exports.getPendingInvites = function(req, res) {
	var returnInvites = [];
	UserModel.findOne({ email : req.user.email }, function(err, user) {
		if(err) return handle(err);
		if(user) {
			SessionModel.find({ _id : { $in : user.pending_invites } }, function(err, invites) {
				if(err) return handle(err);

				returnInvites = invites.map(function(invite) {
					var temp = {};
					temp.confirmed_participants = invite.confirmed_participants;
					temp.invited_participants = invite.invited_participants;
					temp.status = invite.status;
					temp.time_created = invite.time_created;
					temp.title = invite.title;
					temp.description = invite.description;
					temp._id = invite._id;
					return temp;
				});
				res.status(200);
				res.json(returnInvites);
			});
		}
	});
}

module.exports.getActiveSessions = function(req, res) {
	console.log(req.user);
	var sessions = [];
	UserModel.findOne({ email : req.user.email }, function(err, user) {
		if(err) return handle(err);
		if(user) {
			SessionModel.find({ _id : { $in : user.active_sessions } }, function(err, invites) {
				if(err) return handle(err);
				res.status(200);
				res.send(invites);
			});
		}
	});
}

module.exports.getCreatedSessions = function(req, res) {
	var sessions = [];
	UserModel.findOne({ email : req.user.email }, function(err, user) {
		if(err) return handle(err);
		if(user) {
			SessionModel.find({ _id : { $in : user.created_sessions } }, function(err, invites) {
				if(err) return handle(err);
				res.status(200);
				res.send(invites);
			});
		}
	});
}

module.exports.invite = function(req, res) {
	var fields = req.body;

	UserModel.findOne({ email : fields.email }, function(err, user) {
		if(err) return handle(err);
		if(user) {
			res.sendStatus(200);
		} else {
			res.sendStatus(400);
		}
	});
}

module.exports.getSessionById = function(req, res) {
	console.log(req.params);
	var id = req.params.id;
	console.log('stuff ' + id);

	SessionModel.findOne({ _id : id }, function(err, session) {
		if(err) return handle(err);
		if(session) return res.json(session);

	});
}