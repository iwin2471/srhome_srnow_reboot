var db = require("./dbconfig");
var makeObj = require('./makeObj.js');


function viewAttend( req, res ){
	var user_id = req.params['userid'];
	if( req.user.level == 1 ){
		user_id = req.user.id;
	}
	if( user_id ){
		db.Attends.findOne({ "user_id" : user_id }, function( err, result ){
			if( err ){
				throw err;
			}
			if( result ){
				var obj = { attend : JSON.stringify(result) };
			} else {
				var obj = { attend : JSON.stringify([0,0,0,0,0,0,0,0,0,0,0,0]) };
			}
			if( req.user.level == 3 ){
				makeObj( req, res, "chulsukT", obj );
			} else {
				makeObj( req, res, "chulsuk", obj );
			}
		});
	} else {
		res.redirect('/');
	}
};

function viewScore( req, res ){
	var user_id = req.params['userid'];
	if( req.user.level == 1 ){
		user_id = req.user.id;
	}
	if( user_id ){
		db.Scores.findOne({ "user_id" : user_id }, function( err, result ){
			if( err ){
				throw err;
			}
			if( result ){
				var obj = { score : JSON.stringify(result) };
			} else {
				var obj = { score : JSON.stringify([0,0,0,0,0,0,0,0,0,0,0,0]) };
			}
			if( req.user.level == 3 ){
				makeObj( req, res, "suhangT", obj );
			} else {
				makeObj( req, res, "suhang", obj );
			}
		});
	} else {
		res.redirect('/');
	}
};

module.exports = {
	viewAttend : viewAttend,
	viewScore : viewScore
};

