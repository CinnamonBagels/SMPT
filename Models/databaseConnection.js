var dotenv = require('dotenv');
var mongoose = require('mongoose');

//errorhandler
var handle = require('../ErrorHandler/errorHandler');

dotenv.load();
module.exports = mongoose.createConnection(process.env.MONGODB_CONNECTION_URI, function(err) {
	if(err) return handle(err);
	console.log('database connected');
});

