var http = require('http');
var fs = require('fs');
var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var handlebars = require('express3-handlebars');
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

app.engine('handlebars', handlebars({defaultLayout : 'master'}));
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

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

app.get('/', function(req, res) {
	if(req.user) {
		res.redirect('/account');
	} else {
		res.redirect('/login');
	}
});

app.get('/register', userRoutes.getRegister);

app.post('/register', userRoutes.postRegister);

app.get('/login', userRoutes.getLogin);

app.post('/login', userRoutes.postLogin);

app.post('/logout')

app.get('/account', authentication.validateAuthentication, accountRoutes.viewAccount);

app.get('/sessions', authentication.validateAuthentication, sessionRoutes.getSessions);

app.post('/sessions/createNewSession', authentication.validateAuthentication, sessionRoutes.createNewSession);


app.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});