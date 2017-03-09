function makeObj( req, res, ejs, obj ){
    if( obj == undefined ){
        obj = new Object();
    }
//  if( req.user ){
        obj.session = JSON.stringify(req.user);
//  }
    /*
    db.Settings.findOne({ name : "enable" }, function( err, result ){
        if( err ){
            throw err;
        } else if( result ){
            obj.visit = result.value;
    */
            res.render( __dirname + "/../views/" + ejs + ".ejs", obj );
    /*
        }
    });
    */
}


module.exports = makeObj;
