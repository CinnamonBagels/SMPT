'use strict';
//errorhandler
var handle = require('../ErrorHandler/errorHandler');
var UserModel = require('../DB/Models/userModel');
var nodersa = require('node-rsa');
var SessionModel = require('../DB/Models/sessionModel');
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
	var sessionFields = req.body.session;
	var includeSelf = req.body.includeSelf;
	var self = [];
	var asyncTasks = [];
	var invites = sessionFields.emails.slice();
	var remainingInvites = sessionFields.emails.slice();
	var selfIndex;
	var allData = [sessionFields.randomData];
	if(includeSelf) {
		self.push(req.user.email);
		selfIndex = remainingInvites.indexOf(req.user.email);
		if(selfIndex > -1) remainingInvites.splice(selfIndex, 1);
	}
	SessionModel.create({
		created_by : req.user.email,
		title : sessionFields.title,
		description : sessionFields.description,
		invited_participants : invites,
		current_data : sessionFields.randomData,
		pending_invited_participants : remainingInvites,
		instructions : sessionFields.instructions,
		confirmed_invited_participants : self,
		all_data : allData
	},
	function(err, session) {
		if(err) return handle(err);

		remainingInvites.forEach(function(email) {
			asyncTasks.push(function(callback) {
				UserModel.findOneAndUpdate( 
					{ email : email }, 
					{ $push: { pending_invites : session._id } }, 
					function(err, user) {
						if(err) return handle(err);
						callback();
				});
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
			res.send(user.public_key);
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
	temp.instructions = session.instructions;
	temp.invited_participants = session.invited_participants;
	temp.confirmed_invited_participants = session.confirmed_invited_participants;
	temp.pending_invited_participants = session.pending_invited_participants;
	temp.status = session.status;
	temp.current_data = session.current_data;
	temp.current_user = session.current_user;
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
				if(session.confirmed_invited_participants.length + 1 >= 3 && Number(session.status.code) === 0) {
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
			session.pending_data_participants = session.confirmed_invited_participants;
			first_email = session.pending_data_participants.shift();
			second_email = session.pending_data_participants.shift();
			session.status = status.active;
			session.next_user = second_email;
			session.markModified('status');
			session.markModified('pending_data_participants');
			session.markModified('next_user');

			UserModel.findOne({ email : first_email }, function(err, user) {
				if(err) return handle(err);
				if(user) {
					session.current_user = user.email;
					session.markModified('current_user');
					session.save(function(err) {
						if(err) return handle(err);
						return res.sendStatus(200);
					});
				}
			});
		}
	});
}

function finishSession() {

}

/*
	if(pending_data_participants.length) === 0 finish session
	else
	save data to session
	next user is current user.
	add current user to complete users
 */
module.exports.submitData = function(req, res) {
	console.log(req.params);
	var id = req.params.id;
	console.log(id);
	var encryptedData = req.body.data;
	var decryptedData;
	var debuffered;
	var debufferedObject;
	var randomData;
	var finalAggregate = {};
	var i;
	SessionModel.findOne({ _id : id }, function(err, session) {
		if(err) return handle(err);
		if(session) {
			console.log(session.next_user);
			console.log(session.next_user === 'server');
			if(session.next_user === 'server') {
				console.log('the server is doing stuff')
				session.current_user = '';

				session.status = status.complete;
				session.markModified('current_user');
				session.markModified('next_user');
				session.markModified('status');
				session.save(function(err) {
					if(err) return handle(err);
					return res.sendStatus(200);
				});
			} else {
				//set data, 
				//add current user to completed user
				//set current user to next user
				//set next user to current user if server or next
				//
				session.current_data = encryptedData;
				session.completed_data_participants.push(session.current_user);
				session.current_user = session.next_user;
				session.next_user = session.pending_data_participants.length === 0 ? 'server' : session.pending_data_participants.shift();
				session.markModified('current_data');
				session.markModified('current_user');
				session.markModified('next_user');
				session.markModified('pending_data_participants');
				session.markModified('completed_data_participants');
				console.log('current_user in line is ' + session.current_user);
				console.log('next up is ' + session.next_user);
				session.save(function(err) {
					if(err) return handle(err);
					return res.sendStatus(200);
				});
				//return res.send(200);
			}
		}
	});
}

module.exports.getPublicKey = function(req, res) {
	var id = req.params.id;
	SessionModel.findOne({ _id : id }, function(err, session) {
		if(err) return handle(err);
		if(session) {
			if(session.next_user === 'server') {
				UserModel.findOne({ email : session.created_by }, function(err, user) {
					if(err) return handle(err);
					if(user) {
						res.send(user.public_key);
					}
				});
			} 

			UserModel.findOne({ email : session.next_user }, function(err, user) {
				if(err) return handle(err);
				if(user) {
					console.log('sending the public key of ' + user.email);
					console.log(user.public_key);
					return res.send(user.public_key);
				}
			});
		}
	})
}