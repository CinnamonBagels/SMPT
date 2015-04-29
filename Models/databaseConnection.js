var dotenv = require('dotenv');
var mongoose = require('mongoose');

//errorhandler
var handle = require('../ErrorHandler/errorHandler');

dotenv.load();
var connection = mongoose.connect(process.env.MONGODB_CONNECTION_URI, function(err) {
	if(err) return handle(err);
	console.log('database connected');
});

mongoose.connection.on('error', function(err) {
	console.log(err);
});

module.exports = connection;

