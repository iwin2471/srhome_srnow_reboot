var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var db = require('./routes/dbconfig.js');
var fs = require('fs-extra');
var busboy = require('connect-busboy');

router.use(require('body-parser').urlencoded());
router.use(busboy());

router.use(require('./routes/auth.js'));
router.get('/logout', function( req, res ){
	req.logout();
	res.redirect('/');
});

String.prototype.trim = function() {
	return this.replace(/(^\s*)|(\s*$)/gi, "");
}

var makeObj = require('./routes/makeObj.js');

function checkAdmin( req, res, next ){
	if( req.user && req.user.signUp && req.user.level == 9 ){
		return next();
	} else {
		res.redirect('/');
	}
}

function checkSession( req, res, next ){
	if( req.user && req.user.signUp ){
		return next();
	} else {
		res.redirect('/login/' + req.url.substr(1).replace(/\//g,'-'));
	}
}

router.get('/register', function( req, res ){
	if( req.user ){
		res.redirect('/');
	} else {
		makeObj( req, res, "register" );
	}
});
router.post('/register', require('./routes/register.js'));


router.get('/login', function( req, res ){
	if( req.user ){
		res.redirect('/');
	} else {
		makeObj( req, res, "login" );
	}
});

router.get('/getsession', function( req, res ){
	res.send(req.user);
});

router.get('/login/:link', function( req, res ){
	var link = req.params['link'];
	if(!link){
		link = "";
	}
	if( req.user ){
		res.redirect('/');
	} else {
		req.session.returnTo = "/" + req.params['link'].replace(/\-/g,'/');
		makeObj( req, res, "login" );
	}
});
router.get('/', function( req, res ){
	makeObj( req, res, "srNow" );
});
/*
router.get('/index', function( req, res ){
	makeObj( req, res, "index" );
});
*/

router.get('/srHomeCommu/:some', function( req, res ){
	makeObj( req, res, "srHomeCommu" );
});

router.get('/register', function( req, res ){
	if( req.user && req.user.signUp ){
		res.redirect('/');
	} else {
		makeObj( req, res, "register" );
	}
});
router.post('/register', require('./routes/register.js'));
router.get('/api/parse/:type/:ay/:mm', require('./routes/parse.js').parse);
router.get('/api/announce', require('./routes/parse.js').parseAnnounce);
router.get('/api/schedule/:grade/:class/:day', require('./routes/parse.js').parseSchedule);

//router.post('/findpw', require('./routes/findpw.js'));

router.get('/getposts/:type', require('./routes/community.js').getPosts );
router.get('/post/:postid', require('./routes/community.js').viewPost );


router.get('/attend', checkSession, require('./routes/teacher.js').viewAttend );
router.get('/attend/:userid', checkSession, require('./routes/teacher.js').viewAttend );

router.get('/score', checkSession, require('./routes/teacher.js').viewScore );
router.get('/score/:userid', checkSession, require('./routes/teacher.js').viewScore );

router.post('/writereply', checkSession, require('./routes/community.js').writeReply );
router.post('/writepost', checkSession, require('./routes/community.js').writePost );
router.get('/writePost', checkSession, function( req, res ){
	makeObj( req, res, "writePost" );
});



router.get('/:dir/:filename', function( req, res ){
	var dir = req.params['dir'];
	var filename = req.params['filename'];
	var type;
	switch( dir ){
		case "js":
			type = 'text/javascript';
			break;
		case "css":
			type = 'text/css';
			break;
		case "img":
			type = 'image/png';
			break;
		case "font":
			type = "application/x-font-woff";
			break;
		case "svg":
			type = "image/svg+xml";
			break;
	}
	if( type ){
		var url = __dirname + '/' + dir + '/' + filename;
		fs.exists( url, function( exists ){
			if( exists == true && fs.lstatSync(url).isFile() ){
				var file = fs.readFileSync( url );
				res.writeHead(200, { 'Content-Type' : type });
				res.end( file );
			} else {
				res.end();
			}
		});
	} else {
		res.end();
	}
});


router.get('/img/:page/:filename', function( req, res ){
    var dir = "img"
    var filename = req.params['filename'];
    var type = 'image/png';
    var page = req.params['page'];
    if( ( page == "thumb" || page == "detail" ) && filename.indexOf("png") == -1 ){
        require('./routes/item.js').getImage( req, res );
    } else {
        var url = __dirname + '/' + dir + '/' + page + '/' + filename;
        fs.exists( url, function( exists ){
            if( exists ){
                var file = fs.readFileSync( url );
                res.writeHead(200, { 'Content-Type' : type });
                res.end( file );
            } else {
                res.end();
            }
        });
    }
});

router.get('/:link([a-zA-Z0-9]*)', function( req, res ){
	if( req.params['link'] == "favicon.ico" ){
		res.end();
	} else {
		makeObj( req, res, req.params['link'] );
	}
});


module.exports = router;

