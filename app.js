var http = require('http');
var fs = require('fs');
var mongoose = require('mongoose');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var dotenv = require('dotenv');


//errorhandler
var handle = require('./ErrorHandler/errorHandler');

//encryption
var crypto = require('crypto');

var socketConnection = require('./SocketHandler/connection');
var userLogic = require('./User/user');
var authentication = require('./User/authentication');

var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);

//dotenv.load();

var db = require('./Models/databaseConnection');
var User = require('./Models/userModel');
var Session = require('./Models/sessionModel');

var genotypes = require('./Data/genotypes');

function genuid() {
	var sha = crypto.createHash('sha256');
	sha.update(Math.random().toString());
	return sha.digest('hex');
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(session({
	genid: function(req) {
		return genuid()
	},
	secret: 'keyboard cat',
	resave : false,
	saveUninitialized : true
}));

app.use(bodyParser.urlencoded({ extended : true }));

app.set('port', process.env.PORT || 3000);


function response(fields) {
	var responseFields = fields || {};
	var responseObject = {};
	responseObject.success = responseFields.success;
	reponseObject.message = responseFields.message;
	respobseObject.err = responseFields.err;

	return responseObject;
}

//routes
var userRoutes = require('./Routes/users');
var sessionRoutes = require('./Routes/sessions');
var accountRoutes = require('./Routes/accounts');

app.post('/register', userRoutes.postRegister);

app.post('/login', userRoutes.postLogin);

app.post('/logout', userRoutes.postLogout);

app.post('/publickey', authentication.validateAuthentication, userRoutes.storePublicKey);

app.get('/sessions/pendingInvites', authentication.validateAuthentication, sessionRoutes.getPendingInvites);
app.get('/sessions/activeSessions', authentication.validateAuthentication, sessionRoutes.getActiveSessions);
app.get('/sessions/createdSessions', authentication.validateAuthentication, sessionRoutes.getCreatedSessions);

app.post('/sessions/newSession', authentication.validateAuthentication, sessionRoutes.newSession);
app.post('/sessions/newSession/invite', authentication.validateAuthentication, sessionRoutes.invite);



app.get('*', function(req, res) {
	//console.log(req.session.user);
	res.sendFile(path.join(__dirname, '/public/index.html'));
})


app.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});