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

app.use('/home', expressjwt({ secret : 'keyboard cat', credentialsRequired : true }));
app.use('/sessions', expressjwt({ secret : 'keyboard cat', credentialsRequired : true  }));

app.use(function(err, req, res, next) {
	console.log(err);
	if(err.name === 'UnauthorizedError') return res.redirect('/');
	next();
});
app.post('/register', userRoutes.postRegister);

app.post('/login', userRoutes.postLogin);

app.post('/logout', userRoutes.postLogout);

app.post('/account/publickey', userRoutes.storePublicKey);

app.get('/sessions/pendingInvites', sessionRoutes.getPendingInvites);
app.get('/sessions/activeSessions', sessionRoutes.getActiveSessions);
app.get('/sessions/createdSessions', sessionRoutes.getCreatedSessions);
app.post('/sessions/newSession', sessionRoutes.newSession);
app.post('/sessions/newSession/invite', sessionRoutes.invite);

app.get('*', function(req, res) {
	res.sendFile(path.join(__dirname, '/public/index.html'));
});


app.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});