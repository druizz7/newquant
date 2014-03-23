var util		= require('util'),
	async		= require('async'),
	eyes		= require('eyes'),
	fs			= require('fs'),
	moment		= require('moment'),
	crypto 		= require('crypto'),
	request		= require('request'),
	User		= require('../models/user')
	debug		= require('debug')('login');

module.exports = {
	verify: function(req, res) {
		var audience = "http://"+ req.headers.host
		
		console.log("Persona verify audience", audience)
		request.post({
		    url: 'https://verifier.login.persona.org/verify',
		    json: {
		      assertion: req.body.assertion,
		      audience: audience
		    }
		  }, function(e, r, body) {
			  eyes.inspect(body, "persona body")
		      if (e) console.log(e);
		      if (body.status === 'okay') {
		        var email = body.email;
		        //req.session.email = email;
				User.findByEmail(email, function(err, user) {
					if( !err && user) {
						console.log("found user by email")
						req.session.user = user
						res.send(200);
					} else {
						var md5 = crypto.createHash('md5').update(email+app.secret).digest("hex");
						
						var json = {
							singly_id:  md5,
							md5:  		md5,
							email: 		email,
							gravatar: 	app.locals.new_avatar( md5 ) 
						}
						eyes.inspect(json,"new user")
						
						User.save(json, function(err, user ) {
							if( err ) return res.send(400)
							req.session.user = user
							res.send(200)
						})
					}
					
				})
		      } else {
				  //req.logout();
				  req.session.destroy()
				  res.send(200);
		      }
		    });
	},
	logout: function(req, res) {
		console.log("persona logout")
		//req.logout()

	    //req.session.user 	= null;
	    //req.session 		= null;
		delete req.session.user
		req.session.destroy()
		//delete req.headers.cookie
		
	    //res.clearCookie('email');
		//res.send(200);
		res.redirect("/")	    
	}
}