var express = require('express');
var router = express.Router();
var db = require('./dbconfig.js');
var cookieParser = require('cookie-parser')
var cookie = require('cookie')
router.use(cookieParser())
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var session = require('express-session')
var sessionstore = require('sessionstore');
var store = sessionstore.createSessionStore();
var sessionMiddleware = {
	store: store,
	secret: 'dkfdktjgktpdy',
	cookie: { path: '/', domain: 'iori.kr', expires : false }
}
var crypto = require('crypto');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

router.use(session(sessionMiddleware));
router.use(passport.initialize()).use(passport.session());
passport.serializeUser(function(user, done) {
	if( user && user._json ){
		db.Users.findOne({ email : user._json.email }, function( err, result ){
			if( result ){
				user = result;
				done(null, user);
			} else {
				done(null, user._json);
			}
		});
	} else {
		done(null, user);
	}
});
passport.deserializeUser(function(obj, done) {done(null, obj);});

var FacebookStrategy = require('passport-facebook').Strategy;
passport.use(new FacebookStrategy({
	clientID: 'nothing',
	clientSecret: 'nothing',
	callbackURL: "http://iori.kr/api/login/facebook/callback",
	profileFields: ['id', 'emails', 'displayName', 'picture.type(large)']
}, function(accessToken, refreshToken, profile, done) {
	console.log(profile.photos ? profile.photos[0].value : '/img/faces/unknown-user-pic.jpg')
	return done(null, profile);
}));


passport.use(new LocalStrategy({ usernameField : 'email', passwordField : 'password' }, function( email, password, next ){
	db.Users.findOne({ email : email }, function( err, user ){
		if( err ){
			return next(err);
		} else if(!user){
			return next(null,false,{message:"이메일 또는 비밀번호가 잘못되었습니다."});
		} else {
			var shasum = crypto.createHash('sha1');
			shasum.update(password);
			var sha_pw = shasum.digest('hex');
			if( user.password == sha_pw ){
				if( user ){
					return next(null,user);
				}
			} else {
				return next(null,false,{message:'이메일 또는 비밀번호가 잘못되었습니다.'});
			}
		}
	});
}));
router.post('/api/login/local', function( req, res, next ){
	passport.authenticate('local', function( err, user, info ){
		if( err ){
			return next(err);
		} else if( !user ){
			return res.send(info.message);
		} else {
			req.logIn( user, function( error ){
				if( error ){
					return next( error );
				} else {
					delete req.user.password;
					return res.send("success");
				}
			});
		}
	})( req, res, next );
});
/*
router.get('/api/login/token', passport.authenticate('facebook-token', { scope : ['email'] }), function( req, res ){
	res.send(req.user?req.user:401);
});
*/

/*
router.get('/api/login/facebook/:link', function( req, res ){
	console.log(req.params['link']);
	req.session.returnTo = req.params['link'];
	res.redirect('/api/login/facebook');
});
*/


router.get('/api/login/facebook', passport.authenticate('facebook', { scope : ['email'] }));
router.get('/api/login/facebook/callback', function( req, res, next ){
	passport.authenticate('facebook' , function( err, user, info ){
		if( err ){
			return next(err);
		} else if( !user ){
			res.redirect('/');
		} else {
			db.Users.findOne({ email : user._json.email }, function( err, account ){
				if( err ){
					throw err;
				} else {
					req.logIn( user, function( error ){
						if( error ){
							return next(error);
						} else {
							if( account ){
								if( req.session.returnTo ){
									return res.redirect('/' + req.session.returnTo.replace(/\-/g,"/") );
								} else {
									return res.redirect('/');
								}
							} else {
								return res.redirect('/register');
							}
						}
					});
				}
			});
		}
	})( req, res, next );
});

router.get('/logout', function( req, res ){
    req.logout();
    res.redirect('/');
});


module.exports = router;
