//errorhandler
var handle = require('../ErrorHandler/errorHandler');
var UserModel = require('../DB/Models/userModel');
var nodersa = require('node-rsa');
var SessionModel = require('../DB/Models/sessionModel');
var genotypes = require('../Data/genotypes');
var async = require('async');

var status = {
	notReady : {
		code : 0,
		message : 'Not Ready'
	},
	ready : {
		code : 1,
		message : 'Ready'
	},
	active : {
		code : 2,
		message : 'Active'
	}, 
	complete : {
		code : 3,
		message : 'Complete'
	} 
};

module.exports.newSession = function(req, res) {
	var sessionFields = req.body;
	var randomData;
	var self = [];

	var remainingInvites = sessionFields.invited_participants;
	var selfIndex;

	if(sessionFields.includeSelf) {
		self.push(req.user.email);
		selfIndex = remainingInvites.indexOf(req.user.email);
		if(selfIndex > -1) remainingInvites.splice(selfIndex, 1);
	}

	var asyncTasks = [];
	randomData = genotypes.generateRandomData();
	SessionModel.create({
		created_by : req.user.email,
		title : sessionFields.title,
		description : sessionFields.description,
		random_data : randomData,
		invited_participants : sessionFields.invited_participants,
		pending_invited_participants : remainingInvites,
		confirmed_invited_participants : self
	},
	function(err, session) {
		if(err) return handle(err);

		asyncTasks.push(function(callback) {
			UserModel.findOneAndUpdate( 
				{ email : sessionFields.invited_participants }, 
				{ $push: { pending_invites : session._id } }, 
				function(err, user) {
					if(err) return handle(err);
					callback();
			});
		});

		async.parallel(asyncTasks, function(err) {
			if(err) return handle(err);
			res.status(200);
			res.send({ session_id : session._id });
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
					temp.confirmed_invited_participants = invite.confirmed_invited_participants;
					temp.invited_participants = invite.invited_participants;
					temp.status = invite.status;
					temp.time_created = invite.time_created.toLocaleDateString();
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

function processSession(session) {
	var temp = {};
	temp.time_created = session.time_created.toLocaleDateString();
	temp.created_by = session.created_by;
	temp.title = session.title;
	temp.description = session.description;
	temp.invited_participants = session.invited_participants;
	temp.confirmed_invited_participants = session.confirmed_invited_participants;
	temp.pending_invited_participants = session.pending_invited_participants;
	temp.status = session.status;
	temp.current_data = session.current_data;
	return temp;
}
module.exports.getSessionById = function(req, res) {
	var id = req.params.id;

	SessionModel.findOne({ _id : id }, function(err, session) {
		if(err) return handle(err);
		if(session) return res.json(processSession(session));

	});
}

module.exports.acceptInvite = function(req, res) {
	var id = req.params.id;
	UserModel.findOneAndUpdate(
		{ email : req.user.email },
		{ $push: { active_sessions : id } },
		function(err, user) {
		if(err) return handle(err);
		if(user) {
			SessionModel.findOneAndUpdate(
			{ _id : id },
			{ $push: { confirmed_invited_participants : user.email }, $pull: { pending_invited_participants : user.email } },
			function(err, session) {
				if(err) return handle(err);
				console.log(session.confirmed_invited_participants.length);
				if(session.confirmed_invited_participants.length + 1 >= 2 && Number(session.status.code) === 0) {
					console.log('READY');
					session.status = status.ready;
					session.save(function(err) {
						if(err) return handle(err);
						return res.sendStatus(200);
					});
				} else {
					return res.sendStatus(200);
				}
			});
		}
	});
}

module.exports.sendInvite = function(req, res) {
	var id = req.params.id;
	var email = req.body.email;

	UserModel.findOneAndUpdate({ email : email },
		{ $push: { pending_invites : id } }, function(err, user) {
		if(err) return handle(err);
		if(user) {
			SessionModel.findOneAndUpdate(
			{ _id : id },
			{ $push: { invited_participants : email, pending_invited_participants : email } },
			function(err, session) {
				if(err) return handle(err);
				return res.sendStatus(200);
			});
		}
		return res.sendStatus(401);
	});
	

}

module.exports.rejectInvite = function(req, res) {

}

module.exports.startSession = function(req, res) {
	var id = req.params.id;
	var first_email;
	var second_email;
	var key;
	SessionModel.findOne({ _id : id }, function(err, session) {
		if(err) return handle(err);
		if(session) {
			session.pending_data_particiants = session.confirmed_invited_participants;
			first_email = session.pending_data_particiants.shift();
			second_email = session.pending_data_particiants.shift();
			session.status = status.active;
			session.next_user = second_email;
			session.markModified('status');
			session.markModified('pending_data_particiants');
			session.markModified('next_user');

			User.findOne({ email : first_email }, function(err, user) {
				if(err) return handle(err);
				if(user) {
					session.current_user = user.email;
					session.markModified('current_user');
					key = new nodersa(user.public_key);
					session.current_data = key.encrypt(session.random_data, 'base64');
					session.save(function(err) {
						if(err) return handle(err);
						return res.sendStatus(200);
					})
				}
			});
		}
	});
}

module.exports.submitData = function(req, res) {
	var id = req.params.id;

}

module.exports.getPublicKey = function(req, res) {
	var id = req.params.id;
	SessionModel.findOne({ _id : id }, function(err, session) {
		if(err) return handle(err);
		if(session) {
			if(session.pending_data_particiants.length === 0) {
				//give public key of server instead;
			} else {

				UserModel.findOne({ email : session.next_user }. function(err, user) {
					if(err) return handle(err);
					if(user) {
						res.send(user.public_key);
					}
				})
			}

		}
	})
}