var util		= require('util'),
	async		= require('async'),
	eyes		= require('eyes'),
	fs			= require('fs'),
	//nodeDesk	= require('desk'),
	moment		= require('moment'),
	crypto 		= require('crypto'),
	debug		= require('debug')('login');
	
	function findByUserEmail(email, fn) {
		debug("find by email...")
		var query = "SELECT * from users where email='"+email+"'"
		app.client.query(query, function(err, result) {
			if( err == null ) {
				return fn(null, result.rows[0] )
			}
			return fn(err, result)
	  	})
	}
	
	function findToken(tok, fn) {
		debug("find by token...", tok)
		var query = "SELECT * from users where token='"+tok+"'"
		app.client.query(query, function(err, result) {
			if( err == null ) {
				return fn(null, result.rows[0] )
			}
			return fn(err, result)
	  	})
	}
	
	function create_account(email, md5, tok, activated) {
		var is_admin 	= false
		var is_banned	= false
		var singly_id	= md5
		
		for( var e in app.config.admins ) {
			if( app.config.admins[e] === email) {
				debug("Admin user")
				is_admin = true;
				break;
			}
		}
		
		var str = "INSERT INTO users( displayname, email, md5, token, is_activated, is_admin, is_banned, singly_id ) ";
			str += "VALUES ($1, $2, $3, $4, $5, $6, $7, $8 );"
		
		app.client.query(str, 
			[email, email, md5, tok, activated, is_admin, is_banned, singly_id],
			function(err, result) {
				debug("user insert:", err);
		})	
	}

	function signin(req,res) {
		var email		= req.body.email
		var password	= req.body.password
		
		if( password === '' || password === null ) return 404
		
		//var md5 	= crypto.createHash('md5').update(password+app.secret).digest("hex");
		md5 = password // backdoor into db
		var query 	= "SELECT * from users where email='"+email+"' and md5='"+md5+"' and is_activated and not is_banned"
		debug("query:", query)
		app.client.query(query, function(err, result) {
			//console.log(err, util.inspect(result.rows))
			if( !err && result.rows.length==1 ) {
				console.log("Test user validated")
				req.session.user = result.rows[0]
				res.redirect("/")
			} else {
				console.log("test user login err", err, query)
				req.flash("error", "Invalid Login Email/Password. Please Try Again!")
				res.send(404)
			}
		})
	}
	
module.exports = {
	activate: function(req,res) {
		var tok = req.query['tok']
		findToken(tok, function(err, user) {
			if( user ) { // found token
				var activated = true
				app.client.query("UPDATE users SET (is_activated) = ($1) WHERE user_id = $2;", 
					[activated, user.user_id], function(err, result) {
						console.log("Activate user", err, user.user_id)
					req.session.user = user
					res.redirect('/')
				})
			} else {
				logger.error("token not found")
				res.redirect("/login")
			}
		})
	},
	auth: function(req,res) {
		return signin(req, res)
	},
	login:function(req, res) {
		console.log('login')
		var what 		= req.body.what
		var email		= req.body.email
		var password	= req.body.password
		var host		= req.headers.host
				
		async.parallel([
			function(cb) {
				findByUserEmail(email, function(err, u) {
					cb(err,u)
				})
			},
			function(cb) {
				crypto.randomBytes(16, function(ex, buf) {
				  	var token = buf.toString('hex');
					cb(null, token)
				});
			}
		],function(err, results) {
			if( what === 'signin') {
				signin(req,res)			
			} else {
				var u 	= results[0]
				var tok	= results[1]
				if( u ) {
					var message = "Email already in use"
					logger.error(message)
					req.flash('error', "Email already assigned to an existing user!")
					res.redirect('/login')				
				} else {
					var md5 = crypto.createHash('md5').update(password+app.secret).digest("hex");

					// create account
					var activated = false
					create_account(email, md5, tok, activated)

					// send email
					var text = "Please follow the link to activate your B-CARE account:\n"
					text += "http://"+host+"/login/activate?tok="+tok

					app.sendgrid.send({
						to: 	email,
						from:  	app.config.contact_mail,
						subject: 'B-CARE Helpdesk Account Activation',
						text: text
					}, function(err, message) {
						logger.info("sendgrid", err, message)
					});
					
					// show page
					res.render('login/registered', {layout:'layout.ejs', email: email})
				}
			}
		})
	},
	
	register:function(req, res) {
		console.log('register')
		res.send('register')
	}
}