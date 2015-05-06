//errorhandler
var handle = require('../ErrorHandler/errorHandler');
var UserModel = require('../DB/Models/userModel');
var nodersa = require('node-rsa');
var SessionModel = require('../DB/Models/sessionModel');
var genotypes = require('../Data/genotypes');
var async = require('async');
var server_public = 
'-----BEGIN RSA PUBLIC KEY-----\n' +
'MIIBCgKCAQEAgKInUXjWjqLC05cyEvZfZG77SDq54+Xb+XItypAl+iWS03+BAoP5P8UteLug\n' + 
'U9I8IaKdEICp1yQRpowKg3XRpdbpPJGFSc2qBbH3biAXC4KCxu7O8O9+9uWkXhGT3fREN6L+\n' + 
'T6ljbrwkasCxC5m14OA32JfivFjyncs6ueFNCnHc87/vri1IUQeI0NgNptkG3DLqOB/ajBKX\n' + 
'6kUYrcZQbQxlgPme3MTPOyVos05nnd6q/+y6VaLcEBvlIdj/DdLdJzBW+oUPbRxt/wMit4zb\n' + 
'4fr1y3H2oTJyluqxuG8qRB/+K9+ht2rPDPpC5ZA/fXBWdvkEHYkpvCHR0aDeQPsHCQIDAQAB\n' +
'-----END RSA PUBLIC KEY-----\n';
var server_private = 
'-----BEGIN RSA PRIVATE KEY-----\n' + 
'MIIEpAIBAAKCAQEAgKInUXjWjqLC05cyEvZfZG77SDq54+Xb+XItypAl+iWS03+BAoP5P8Ut\n' + 
'eLugU9I8IaKdEICp1yQRpowKg3XRpdbpPJGFSc2qBbH3biAXC4KCxu7O8O9+9uWkXhGT3fRE\n' + 
'N6L+T6ljbrwkasCxC5m14OA32JfivFjyncs6ueFNCnHc87/vri1IUQeI0NgNptkG3DLqOB/a\n' +
'jBKX6kUYrcZQbQxlgPme3MTPOyVos05nnd6q/+y6VaLcEBvlIdj/DdLdJzBW+oUPbRxt/wMi\n' + 
't4zb4fr1y3H2oTJyluqxuG8qRB/+K9+ht2rPDPpC5ZA/fXBWdvkEHYkpvCHR0aDeQPsHCQID\n' +
'AQABAoIBAQANPqUFwod1EFU3LC4/vZZ85OCCw2k4igZoXNVSMh128D95/3rtI2Gaq1bPQ6Jy\n' +
'fwcp/3BkrprOSCx5FZpPhuYbSVGipukufDqxc22irTMyQDHvAc/VBxPvoB2Ygf7Tr78Ga4X7\n' +
'9dkDIeQuCcExDJapnOyjJKB3/ECe9roJQaWJGaGZ2xXK1hvW/SMFCLPX8pQhyXYEWdXls5d1\n' +
'vpGzwJaxldyor3tuDdmRDCubw5bI58+a2VM4EyiKFH2Tm/nvbLJNdcWTQIR1lgUSmf5D+nCW\n' +
'+G5YdfHgGQDB6dbaGVnjQUDdWuhErzppzTbtxGX/Q2ue0uRyCeqXbM27BqgCfEsxAoGBAOvM\n' +
'FAYr1dm7sFlm526vDAzGvomLhhMK7vrQNmYGTETYRkarzXuX55LuTPwByapVsBVxzA6UgCGF\n' +
'dLlKEEQVT4+viK1GdsAfryEGPa7Z7Vn814kGX5bS4ZJQksYQp5R7nJqjjeHIDX4dEOu852h0\n' +
'LStYywNeYyyBLkJwjGCkXA8XAoGBAIunkdMhEwsldvnqe0k0j10pbMwx/k2q9xt1Lm8wkhSa\n' +
'hO9j9moTzQNI1YQ3iwQhPF+8OVPWvtrRLVSB/Li3ncsIknRmla43ogIi11N37LnWOnDVTEDs\n' +
'Z5seVcRa1dmXh+/NEfQm7HMKoiSDbkYhCHvqL7Mq87yI0kiE4Mfs4m7fAoGBAK0rCSGnG7x1\n' +
'zIM7wYdV4uGXK+NTpjlh9DQaqXiv818z/hh0n8m+u4D6pWsF3RbNKy30jsm+YYM8wYY6UEvP\n' +
'4shBP30RnLBoFHOKY85/mYJW3+tv1M+tO5/6sG/pV0kCpvYiW1aPVulha0XVS5U4jNuisCVf\n' +
'MjJDBLgic9Wdn0YtAoGANifHDr52qg3fM07QfDTbm17jB9QjL28q4ATy+r81BrRc9JApED2Z\n' +
'dLqbwefgCrvws5dEC9TsseIH2AuIOwFJOWCbmnPle2erdXSZV47bx7zhcLvmFA8Ypjh/PeOT\n' +
'pgty9XTqj2lAq+PluI8XBi7tIVBRKwNu/R95nBGbMSwVKrUCgYBuoRwfMP2cWLF2/1HMUWYB\n' +
'04MIsrN5oSnFADO4ko9tgBg2wV9tirvF/pTHGEF3hzuHtIYdW4urT5x4l9fhv98cryoLQmMx\n' +
'wWsggCwDd7SXUuzIzYhIwdxVgAwpcuxzD5nOGqCkm2d/1LLDIUdpwzEfCSFMftaGn8CqPANL\n' +
'VXpiRg==\n-----END RSA PRIVATE KEY-----\n';

var publicKey = new nodersa(server_public);
var privateKey = new nodersa(server_private);

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
	console.log(sessionFields.invited_participants);

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
					key = new nodersa(user.public_key, { environment : 'browser' });
					session.current_data = key.encrypt(session.random_data, 'base64');
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
				session.next_user = '';
				randomData = session.random_data;
				decryptedData = privateKey.decrypt(encryptedData);
				debuffered = decryptedData.toString();
				debufferedObject = JSON.parse(debuffered);
				i = 0;
				finalAggregate.case = debufferedObject.case.map(function(element) {
					return element - randomData.case[i++];
				});
				i = 0;
				finalAggregate.control = debufferedObject.control.map(function(element) {
					return element - randomData.control[i++];
				});

				session.aggregate_data = finalAggregate;
				session.status = status.complete;
				session.markModified('current_user');
				session.markModified('next_user');
				session.markModified('aggregate_data');
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
				return res.send(server_public);
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