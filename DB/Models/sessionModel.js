var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var findOrCreate = require('mongoose-findorcreate');
var autoIncrement = require('mongoose-auto-increment');
var db = require('../databaseConnection');

autoIncrement.initialize(db);

//status 
//0 : not enough users
//1 : ready
//2 : active
//3 : done
var sessionModel = new Schema({
	time_created : { type : Date, default : Date.now },
	created_by : String,
	title : String,
	description : String,
	random_data : { type : Object, default : {} },
	aggregate_data : { type : Object, default : {} },
	invited_participants : { type : Object, default : [] },
	pending_invited_participants : { type : Object, default : [] },
	confirmed_invited_participants : { type : Object, default : [] },
	pending_data_participants : { type : Object, default : [] },
	completed_data_participants : { type : Object, default : [] },
	status : { type : Object, default : { code : 0, message : 'Not Ready' } },
	current_user : String,
	next_user : String,
	current_data : String
});

sessionModel.plugin(autoIncrement.plugin, 'Session')
module.exports = mongoose.model('Session', sessionModel);