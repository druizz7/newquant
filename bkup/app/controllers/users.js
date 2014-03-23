var util	= require('util'),
	und		= require('underscore'),
	eyes	= require('eyes'),
	path	= require('path'),
	fs		= require('fs'),
	User	= require('../../app/models/user'),
	crypto 	= require('crypto'),
	debug	= require('debug')('admin');
	
	// make a gravatar if it does not exist
	function make_gravatar(user) {
		var md5 	= crypto.createHash('md5').update(user.displayname+user.name).digest("hex");
		grav_url 	= 'http://www.gravatar.com/avatar.php/'+md5
		grav_url	+= "?s=32&d=identicon"
		console.log("Made gravatar:", grav_url)
		return grav_url
	}
	
module.exports = {
	sync_users_db: function(req, res) {
		User.sync_with_desk()
		res.redirect('/admin')
	},
	
	users: function(req, res) {
		debug('admin/users');
		var user 	= req.session.user;
		
		if( user.is_admin) {		
			var query1 	= "SELECT hospital_id as id, name from hospitals"
			app.client.query(query1, function(err, result) {
				var hospitals = result.rows;
				//eyes.inspect(hospitals, "hospitals")
				
				var query2 	= "SELECT * from users"
				app.client.query(query2, function(err, result) {
					var users = result.rows
		
					res.render( 'users/users', 
						{	layout: 'admin_layout.ejs',
							menu: '#users_menu',
							user: user,
							hospitals: hospitals,
							users: und.sortBy(users, function(e) { return e.displayname })
						});		
				})
			})
		} else {
		
		}
	},
	user_edit: function(req, res) {
		debug('admin/user_edit');

		var user 	= req.session.user;
		var id		= req.params['id']
		if( user && (user.user_id == id || user.is_admin)) {
			debug("user_edit", id, user.user_id)
			var query1 	= "SELECT hospital_id as id, name from hospitals"
			app.client.query(query1, function(err, result) {
				var hospitals = result.rows;
				//eyes.inspect(hospitals, "hospitals")
				var query2 	= "SELECT * from users where user_id='"+id+"'"
				app.client.query(query2, function(err, result) {	
					debug("found", result.rows.length)
					if( result.rows.length == 0 ) {
						debug("redirect to /")
						return res.redirect('/')
					} else {	
						console.log("trying to find user:", id, err)
						if( !err) {
							var u = result.rows[0]
							if( (u.gravatar === null) || (u.gravatar == "null")) {
								debug("db gravatar:", u.gravatar)
								u.gravatar = make_gravatar(u)
							}
							
							for( var k in u ) {
								if( u[k] == null ) 	u[k] = ''
							}
							
							console.log("edit user:" + util.inspect(u))
							res.render( 'users/user_edit', 
							{	layout: 'layout.ejs',
								menu: '#user_edit_menu',
								user: user,
								u: u,
								hospitals: hospitals
							});		
						} else {
							res.send("User Edit Error:", err)
						}
					}
				})
			})
		} else {
			res.redirect("/")
		}
	},
	
	user_update: function(req, res) {
		debug("user_update")
		var user = req.session.user;
		
		//eyes.inspect(req.body, "update body")
		
		//if( req.body.email === undefined || req.body.email === "" || req.body.email.indexOf('@') <0 ) {
		//	console.log("email undefined... try again")
		//	req.session.user.email = undefined
		//	return res.redirect('/users/'+req.body.user_id)
		//}
		
		// NOTE: Cannot override validated email
		
		var update = {
			'user_id':				req.body['user_id'],
			'first_name': 			req.body['first_name'],
			'last_name':  			req.body['last_name'],
			'displayname': 			req.body['displayname'],
			'gravatar':  			req.body['gravatar'],
			'phone': 	 			req.body['phone'],
			'alternate_phone': 	 	req.body['alternate_phone'],
			//'email': 	 			req.body['email'],
			'hospital_id': 			req.body['hospital_id'],
			'is_admin': 			req.body['is_admin'] === 'on' ? true : false,
			'is_banned': 			req.body['is_banned'] === 'on' ? true : false,
			"desk_id": 				req.body['desk_id']
		}
		
		User.update( update, function(err) {
			console.log("User updated, err:", err)
			if( !err ) {
				req.session.user.first_name 	= update.first_name
				req.session.user.last_name 		= update.last_name
				req.session.user.displayname 	= update.displayname
				req.session.user.gravatar 		= update.gravatar
				req.session.user.phone 			= update.phone
			//	req.session.user.email 			= update.email
				req.session.user.phone 			= update.phone
				req.session.user.alternate_phone= update.alternate_phone
				req.session.user.hospital_id 	= update.hospital_id
				req.session.user.is_admin 		= update.is_admin
				req.session.user.is_banned 		= update.is_banned
				req.session.user.desk_id 		= update.desk_id
				
				if( true ) {
				//	app.twilio.sms.messages.post({
				//	    to:  	update.phone ,
				//	    from:   app.config.twilio_number,
				//	    body:   user.displayname + ', your profile has been updated.\n Thank you.\n The B-CARE Help Desk Team'
				//	}, function(err, text) {
				//		if( err ) {
				//			logger.error("Error sending twilio SMS ", err, update.phone, app.config.twilio_number)
				//		}
				//	});
				
					app.sendgrid.send({
						to: update.email,
						from: app.config.support_email,
						subject: 'B-CARE Help Desk Account Modified',
						  text: 'Your account has been modified.  Please contact us if this is an error'
					}, function(err, message) {
						debug("Sendgrid error", err, message)
						if (err) {
							logger.error("SendGrid Error %s %s", err, message)
						}
					});
				}
				res.render('users/user_updated', { layout: true , user: req.session.user})
			 } else {
				res.send(err)
			}
		})
		
	},
	
	user_delete: function(req, res) {
		var user = req.session.user;
	}
};