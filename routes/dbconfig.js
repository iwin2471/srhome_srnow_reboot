var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/db')
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function callback() {
	console.log('db connected');
});

var UserSchema = new mongoose.Schema({
	id : { type : Number },
	name : String,
	email : String,
	password : { type : String },
	level : { type : Number, default : 1 },
	signUp : { type : Boolean, default : true },
	barcode : { type : String },
});

var PostSchema = new mongoose.Schema({
	id : { type : Number },
	user_id : { type : Number },
	user_name : String,
	text : { type : String, default : "" },
	html : { type : String, default : "" },
	date : { type : Date, default: Date.now },
	file : { type : Boolean },
	title : { type : String },
	type : { type : Number }
});

var ReplySchema = new mongoose.Schema({
	id : { type : Number },
	user_id : { type : Number },
	user_name : String,
	post_id : { type : Number },
	text : String,
	date : { type: Date, default: Date.now }
});

var ScheduleSchema = new mongoose.Schema({
	grade : { type : Number },
	class : { type : Number },
	day : { type : Number },
	arr : [{ type : String }]
});

var AttendSchema = new mongoose.Schema({
	user_id : { type : Number },
	arr : [{ type : Number }]
});

var ScoreSchema = new mongoose.Schema({
	id : { type : Number },
	user_id : { type : Number },
	subject : { type : String },
	score : { type : Number },
	name : { type : String },
	text : { type : String },
	date : { type: Date, default: Date.now }
});


module.exports = {
	Users : mongoose.model('users',UserSchema),
	Posts : mongoose.model('posts',PostSchema),
	Replys : mongoose.model('replys',ReplySchema),
	Schedules : mongoose.model('schedules',ScheduleSchema),
	Attends : mongoose.model('attends',AttendSchema),
	Scores : mongoose.model('scores',ScoreSchema)
}
