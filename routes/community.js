var db = require("./dbconfig");
var fs = require('fs-extra')
var makeObj = require('./makeObj.js');

function viewPost( req, res ){
	var postid = req.params['postid'];
	if( !postid ){
		res.redirect('/');
	}
	db.Posts.findOne({ id : postid }, function( err, result ){
		if( err ){
			throw err;
		} else if ( result ){
			var obj = {};
			obj.post = JSON.stringify(result);
			db.Replys.find({ post_id : postid }, function( err2, replys ){
				if( err2 ){
					throw err2;
				}
				if( replys ){
					obj.replys = JSON.stringify(replys);
				}
				makeObj( req, res, "viewPost", obj );
			});
		} else {
			res.redirect('/');
		}
	});
}

function getPosts( req, res ){
	db.Posts.find({ type : req.params['type'] }).sort({id:-1}).exec( function( err, result ){
		if( err ){
			throw err;
		}
		res.send(result);
	});
}

function writeReply( req, res ){
	var text = req.body['text'];
	var postid = req.body['post_id'];
	db.Replys.findOne().sort({id:-1}).exec( function( err, result ){
		var replyid;
		if( !result ){
			replyid = 1;
		} else {
			replyid = result.id + 1;
		}
		var current = new db.Replys({
			id : replyid,
			post_id : postid,
			text : text,
			user_id : req.user.id,
			user_name : req.user.name
		})
		current.save( function( err2 ){
			if( err2 ){
				throw err2;
			} else {
				res.redirect('/post/'+postid);
			}
		});
	});
}

function writePost( req, res ){
	var text = "";
	var title = "";
	var filecount = false;
	var type = 0;
	db.Posts.findOne().sort({id:-1}).exec( function( err, result ){
		var postid;
		if( !result ){
			postid = 1;
		} else {
			postid = result.id + 1;
		}
		req.pipe( req.busboy );
		req.busboy.on( 'file', function( fieldname, file, filename ){
			if( filename && filename.length > 0 ){
				filecount = true;
			}
			var fstream;
			var uploadedFile = __dirname + '/../img/postimg/' + postid + '.png';
			fstream = fs.createWriteStream( uploadedFile );
			file.pipe( fstream );
			fstream.on( 'close' , function(){});
		});
		req.busboy.on( 'field', function( fieldname, val ){
			if( fieldname == "text" ){
				text = val;
			} else if( fieldname == "title" ){
				title = val;
			} else if( fieldname == "type" ){
				type = val;
			}
		});
		req.busboy.on( 'finish', function(){
			var current = new db.Posts({
				id : postid,
				user_id : req.user.id,
				user_name : req.user.name,
				text : text,
				file : filecount,
				title : title,
				type : type
			});
			current.save( function( err ){
				if( err ){
					throw err;
				} else {
					res.redirect('/post/'+postid);
				}
			});
		});
	})
}

module.exports = {
	writePost : writePost,
	writeReply : writeReply,
	getPosts : getPosts,
	viewPost : viewPost
};

