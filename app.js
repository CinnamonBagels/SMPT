var http = require('http');
var fs = require('fs');
var mongoose = require('mongoose');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var dotenv = require('dotenv');
var expressjwt = require('express-jwt');
var jwt = require('jsonwebtoken');

var tokenAuth = expressjwt({ secret : 'keyboard cat', credentialsRequired : true });

//errorhandler
var handle = require('./ErrorHandler/errorHandler');

//encryption
var crypto = require('crypto');

var userCredentials = require('./User/userCredentials');

var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);

//dotenv.load();

var db = require('./DB/databaseConnection');
var User = require('./DB/Models/userModel');
var Session = require('./DB/Models/sessionModel');

var genotypes = require('./Data/genotypes');

app.set('port', process.env.PORT || 3000);


app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended : true }));

//routes
var userRoutes = require('./User/userRoutes');
var sessionRoutes = require('./Session/sessionRoutes');

app.use(function(err, req, res, next) {
	console.log(err);
	if(err.name === 'UnauthorizedError') return res.redirect('/');
	next();
});
app.post('/register', userRoutes.postRegister);

app.post('/login', userRoutes.postLogin);

app.post('/logout', userRoutes.postLogout);

app.post('/account/publickey', tokenAuth, userRoutes.storePublicKey);

app.get('/sessions/pendingInvites', tokenAuth, sessionRoutes.getPendingInvites);
app.get('/sessions/activeSessions', tokenAuth, sessionRoutes.getActiveSessions);
app.get('/sessions/createdSessions', tokenAuth, sessionRoutes.getCreatedSessions);
app.post('/sessions/newSession', tokenAuth, sessionRoutes.newSession);
app.get('/sessions/getSession/:id', tokenAuth, sessionRoutes.getSessionById);
app.post('/sessions/newSession/invite', tokenAuth, sessionRoutes.invite);

app.get('*', function(req, res) {
	res.sendFile(path.join(__dirname, '/public/index.html'));
});


app.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});