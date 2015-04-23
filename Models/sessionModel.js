var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var findOrCreate = require('mongoose-findorcreate');
var autoIncrement = require('mongoose-auto-increment');
var db = require('./databaseConnection');

autoIncrement.initialize(db);

//status 
//0 : not enough users
//1 : ready
//2 : active
//3 : done
var sessionModel = new Schema({
	time_created : { type : Date, default : Date.now },
	time_end : Date,
	title : String,
	description : String,
	random_data : { type : Object, default : {} },
	aggregate_data : { type : Object, default : null },
	invited_participants : { type : Object, default : [] },
	confirmed_participants : { type : Object, default : [] },
	confirmed_participant_publickeys : { type : Object, default : [] },
	status : { type : Number, default : 0 },
});

sessionModel.plugin(autoIncrement.plugin, 'Session')
module.exports = mongoose.model('Session', sessionModel);