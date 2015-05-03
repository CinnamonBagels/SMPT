var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var findOrCreate = require('mongoose-findorcreate');

var autoIncrement = require('mongoose-auto-increment');
var db = require('../databaseConnection');

autoIncrement.initialize(db);

var userSchema = new Schema({
	name : String,
	email : String,
	password : String,
	salt : String,
	region : String,
	public_key : {type : String, default : '' },
	pending_invites : { type : Object, default : [] },
	active_sessions : { type : Object, default : [] },
	created_sessions : { type : Object, default : [] },
	completed_sessions : { type : Object, default : [] }
});

userSchema.plugin(findOrCreate);
userSchema.plugin(autoIncrement.plugin, 'User');

module.exports = mongoose.model('User', userSchema);