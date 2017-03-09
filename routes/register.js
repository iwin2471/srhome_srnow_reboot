var crypto = require("crypto");
var async = require("async");
var db = require("./dbconfig");
//var smtpTransport = require("./mailconfig").smtpTransport;

function Register( req, res ){
	var userid;
	if(req.body['userid']){
		userid = parseInt(req.body['userid']);
	}
	var password = req.body['password'];
	var email = req.body['email'];
	var name = req.body['name'];
	var barcode = req.body['barcode'];
	async.parallel([
		function(callback){
			var shasum = crypto.createHash('sha1');
			shasum.update(password);
			password = shasum.digest('hex');
			callback(null,'gd');
		},
		function(callback){
			db.Users.findOne({ email : email }, function( err, result ){
				if( !result ){
					callback(null,'gd');
				} else {
					callback(null,"이미 사용중인 메일입니다.");
				}
			});
		},
		function(callback){
			if( userid ){
				db.Users.findOne({ userid : userid }, function( err, result ){
					if( !result ){
						callback(null,'gd');
					} else {
						callback(null,"이미 사용중인 학번입니다.");
					}
				});
			} else {
				callback(null,'gd');
			}
		}
	], function( error, result ){
		if( error ){
			throw error;
		} else if( result[0] == "gd" && result[1] == "gd" && result[2] == "gd" ){
			db.Users.findOne({ id : { $lt : 10000 } }).sort({id:-1}).exec( function( err, result ){
				if( err ){
					throw err;
				}
				if( !userid ){
					if( result ) {
						userid = result.id + 1;
					} else {
						userid = 1;
					}
				}
				var level = 1;
				if( userid < 10000 ){
					level = 3;
				}
				var current = new db.Users({
					id : userid,
					password : password,
					email : email,
					name : name,
					level : level,
					barcode : barcode
				});
				if( req.user ){
					current.type = req.user.provider;
					current.key = req.user.id;
				}
				current.save( function( err2 ){
					if( err2 ){
						throw err2;
					} else {
						var attend = new db.Attends({
							user_id : userid,
							arr : [0,0,0,0,0,0,0,0,0,0,0,0]
						});
						attend.save();
						res.redirect("/");
//						res.send("회원가입완료");
					}
				});
			});
		} else {
			if( result[0] != "gd" ){
				res.send(result[0]);
			} else {
				res.send(result[1]);
			}
		}
	});
};

module.exports = Register;

