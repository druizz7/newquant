var express 		= require('express'),
	util			= require('util'),
	partials 		= require('express-partials'),
	assert			= require('assert'),
	fs				= require('fs'),
	path			= require('path'),
	debug 			= require('debug')('server'),
	engines			= require('consolidate'),
	
	//passport 			= require('passport'),
	//LocalStrategy 	= require('passport-local').Strategy,
	//BasicStrategy 	= require('passport-http').BasicStrategy,
	//SinglyStrategy 	= require('passport-singly').Strategy,
	//PersonalStrategy 	= require('passport-persona').Strategy,
	
	OAuth			= require('oauth'),
	PGStore 		= require('connect-pg'),
	ejs				= require('ejs'),
	analytics 		= require('analytics-node'),
	crypto 			= require('crypto'),
	eyes			= require('eyes'),
	flash 			= require('connect-flash'),
	
	// SendGrid 		= require('sendgrid').SendGrid,
	AWS 			= require('aws-sdk'),
	winston 		= require('winston'),
	hospitals		= require("./app/models/hospital.js"),
	zendesk 		= require('node-zendesk'),
	users			= require("./app/models/user.js");
	
  	require('winston-papertrail').Papertrail;

  	global.logger = new winston.Logger({
	    transports: [
	    	new (winston.transports.Console)(),

	        new winston.transports.Papertrail({
	            host: 'logs.papertrailapp.com',
	            port: 12836,
	            colorize: true
	        })
	    ]
	});

	// Pick a secret to secure your session storage
	app.sessionSecret = process.env.COOKIEHASH || 'BCARE-PGC-2012-11';

	exports.boot = function(app){
		// load config
		app.config 	= JSON.parse(fs.readFileSync("./config/config.yaml"));

		// The port that this express app will listen on
		debug("app_port:"+app_port)

		var port, hostBaseUrl

		if( process.env.NODE_ENV === 'development') {
			port 			= app_port;
			hostBaseUrl 	= 'http://localhost:' + port;
		} else {
			hostBaseUrl 	= app.config.HOSTBASEURL
			port 			= process.env.PORT;		
		}

		app.set('hostBaseUrl', hostBaseUrl)
		app.set('port', port)

		logger.info("hostBaseUrl:", hostBaseUrl)

		bootApplication(app)

		analytics.init({ secret: app.ANALYTICS_SECRET });
	}

// ===============================	
// Helper to set env in app global
//
function app_set_env( env_var ) {
	app[env_var] = process.env[env_var]
	assert( app[env_var], env_var + " env is missing")
}

// ===========================
// App settings and middleware
function bootApplication(app) {

	app_set_env( 'AWS_ACCESSKEYID')
	app_set_env( 'AWS_SECRETACCESSKEY')
	app_set_env( 'AWS_REGION')
	app_set_env( 'NEW_RELIC_LICENSE_KEY')
	app_set_env( 'ANALYTICS_SECRET')
	
	AWS.config.update({
		accessKeyId:		app.AWS_ACCESSKEYID,
		secretAccessKey:	app.AWS_SECRETACCESSKEY,
		region:				app.AWS_REGION
	});
		   
	app.s3 		= new AWS.S3({apiVersion: '2006-03-01'});
	
	// define a custom res.message() method
	// which stores messages in the session
	app.response.message = function(msg){
	  // reference `req.session` via the `this.req` reference
	  var sess = this.req.session;
	  // simply add the msg to an array for later
	  sess.messages = sess.messages || [];
	  sess.messages.push(msg);
	  return this;
	};
	
	var policy =  "default-src 'self';" +
	              "frame-src 'self' https://login.persona.org http://code.jquery.com;" +
	              "script-src 'self' 'unsafe-inline' http://d2dq2ahtl5zl1z.cloudfront.net http://login.persona.org http://code.jquery.com http://www.google-analytics.com http://api2.segment.io;" +
	              "style-src 'self' 'unsafe-inline'";

	app.use(function(req, res, next) {
	  // Firefox and Internet Explorer
	  //res.header("X-Content-Security-Policy", policy);
	  // Safari and Chrome
	  //res.header("X-WebKit-CSP", policy);
	  // continue with next middleware
	  res.locals.analytics_secret = app.ANALYTICS_SECRET;
	  next();
	});
	
	// serve static files
	app.use(express.static(__dirname + '/public'));
	app.use(partials());

	app.set('views', __dirname + '/app/views')
	app.set('helpers', __dirname + '/app/helpers/')
   	app.set('view engine', 'ejs');
	app.engine('html', engines.ejs);
	app.engine('jade', engines.jade)
	
 	//app.set('client_side_layout', __dirname + '/app/views/layout.ejs')
	//app.set('view options', { layout: 'layout.ejs' })

	// cookieParser should be above session
	app.use(express.cookieParser(process.env.COOKIEHASH))
	//app.use(express.cookieSession());
	
	//app.use(express.csrf());
	// bodyParser should be above methodOverride
	// app.use(express.bodyParser())
	app.use(express.urlencoded())
	app.use(express.json())
	
	app.use(express.methodOverride())

	// custom middleware
	//app.use(function(req, res, next) {
	  // csrf
	//  res.locals.token = req.session._csrf;
	  // cookie
	//  if (req.session.email) {
	//    res.cookie('email', req.session.email);
	//  }
	  // continue with router
	//  next();
	//});
	
	var pg 			= require('pg'); 
	
	//var conString 	= process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/bcare";
	var conString 	= process.env.DATABASE_URL || "postgres://nodepg:password@localhost:5432/bcare";
	logger.info("Connecting to db:", conString)
	
 	function pgConnect (callback) {
		//logger.info("pgConnect...")
		pg.connect(conString,
		function (err, client, done) {
			if (err) {
				logger.info(JSON.stringify(err));
			}
			if (client) {
				callback(client);
			}
			done();
		});
    };	
		
	app.use(express.session({
		  secret: app.sessionSecret,
		  cookie: { maxAge: 24 * 360000}, //1 Hour*24 in milliseconds
		  //cookie: { maxAge: null}, 
		  store: new PGStore(pgConnect)
	}))
    app.use(flash());

	app.client = new pg.Client(conString);
	app.client.connect(function(err) {
		if (err) {
			return console.error('could not connect to postgres', err);
		}
		app.client.query('SELECT NOW() AS "theTime"', function(err, result) {
			if (err) {
				return console.error('error running query', err);
			}
			logger.info("startup time: " + result.rows[0].theTime);
			//output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
			//
		});
	});

	
	app.use(express.favicon())
	
//	passport.use(new PersonalStrategy({
//		audience: 'http://localhost:5000'
//	}, function(email, done) {
//		users.findByEmail(email, function(err, user) {
//			console.log("found by email strategy", err, user)
//			if( err ) return done(err)
//			return done(null, user);
//		});
//	}));
	
//	function findByUserEmail(username, fn) {
//		console.log("find by email...")
//		var query = "SELECT * from users where email='"+email+"'"
//		app.client.query(query, function(err, result) {
//			if( err == null ) {
//				return fn(null, result.rows[0] )
//			}
//			return fn(err, result)
//	  	})
//	}
	
		
//	if( SINGLY_CLIENT_ID === undefined ) {
//		passport.use( new LocalStrategy({},
//			function(email, password, done) {
//				try {
//				console.log("passport local use")
//				// asynchronous verification, for effect...
//				process.nextTick(function () {
//					// logger.info("Passport Local Strategy User Check:", username, password)
//					// Find the user by username. If there is no user with the given
//					// username, or the password is not correct, set the user to `false` to
//					// indicate failure. Otherwise, return the authenticated `user`.
//					findByUserEmail(email, function(err, user) {
//						if (err) { 
//							logger.info("user not found:", user, err)
//							return done(err); 
//						}
//					    console.log("found user:", util.inspect(user))
//						
//						if (!user) {
//							logger.info("Undefined user returned by findByUsername")
//							return done(null, false); 
//						}
//					
//						var md5 = crypto.createHash('md5').update(password+app.secret).digest("hex");
//						if (user.md5 != md5) { 
//							logger.info("User password mismatched")
//							return done(null, false); 
//						}
//						logger.info("User:"+ username+" logged in.")
//						return done(null, user);
//					})
//				});
//			} catch(e) { console.log("localstrat e:", e)}
//			}
//		));
//	} else {
//		console.log("Using SINGLY...")
		// Use the SinglyStrategy within Passport.
		//   Strategies in Passport require a `verify` function, which accept
		//   credentials (in this case, an accessToken, refreshToken, and Singly
		//   profile), and invoke a callback with a user object.
		
//		app_set_env('SINGLY_CLIENT_ID')
//		app_set_env('SINGLY_CLIENT_SECRET')
//		app_set_env('SINGLY_CALLBACK_URL')


//		app.SINGLY_CALLBACK_URL	= app.get('hostBaseUrl') + "/auth/singly/callback";
//		logger.info("Setting SINGLY_CALLBACK_URL:", app.SINGLY_CALLBACK_URL)
		
//		passport.use(new SinglyStrategy({
//		    clientID: 		app.SINGLY_CLIENT_ID,
//		    clientSecret: 	app.SINGLY_CLIENT_SECRET,
//		    callbackURL: 	app.SINGLY_CALLBACK_URL
//		  },
//		  function (accessToken, refreshToken, profile, done) {
//		    // asynchronous verification, for effect...
//		    process.nextTick(function () {
//		      // To keep the example simple, the user's Singly profile is returned to
//		      // represent the logged-in user.  In a typical application, you would want
//		      // to associate the Singly account with a user record in your database,
//		      // and return that user instead.
//		      //console.log(accessToken, refreshToken, profile);
//			  var user = null;
//			  try {
//				  if( profile ) {
//					  console.log("singly profile:", util.inspect(profile))
//					  user = {
//						  singly_id: 	profile.id,
//						  displayname: 	profile.displayName,
//						  gravatar: 	profile._json.gravatar || '/img/no_gravatar.png',
//						  email: 		profile._json.email
//					  };
//				   } else {
//					   console.log("Null profile returned... argh") 
//				   }
//				  //session.user = user;
//				  // save it here
//			  } catch(e) { console.log("** Exception:", e); }
//		      return done(null, user);
//		    });
//		  }
//		));
//	}

//	passport.serializeUser(function(user, done) {
//		console.log('serialize: user', user)
//		done(null, user);
//	});
	
//	passport.deserializeUser(function(user, done) {
//		console.log('deserialize: user')
		//app.client.query('SELECT * FROM users where username='+user.username, function(err, user) {
		//	console.log(user.rows[0])
	  	//  done(null, user.rows[0]);
	  	//});
//		done(null, user);
//	});
	
	// Simple route middleware to ensure user is authenticated.
	//   Use this route middleware on any resource that needs to be protected.  If
	//   the request is authenticated (typically via a persistent login session),
	//   the request will proceed.  Otherwise, the user will be redirected to the
	//   login page.
	function ensureAuthenticated(req, res, next) {
	  if (req.isAuthenticated()) {
		  return next();
	  }

	  res.redirect('/login');
	}
	
	//app.use(passport.initialize());
	//app.use(passport.session());
	
	// routes should be at the last
	app.use(app.router)
	
	app.locals.find_user = function( users, id ) {
		console.log("Find user:", id)
		for( var u in users ) {
			var user = users[u];
			console.log("Find user:", id, user.id)
			
			if( user.id == id ) {
				return user;
			}
		}
	}
	
	// generate new_avatar
	app.locals.new_avatar = function( str ) {
		var md5 	= crypto.createHash('md5').update(str).digest("hex");
		grav_url 	= 'http://www.gravatar.com/avatar.php/'+md5
		grav_url	+= "?s=32&d=identicon"
		//console.log("Made gravatar:", grav_url)
		return grav_url
	}
	
	// expose the "messages" local variable when views are rendered
	app.use(function(req, res, next){
	  var msgs = req.session.messages || [];

	  // expose "messages" local variable
	  res.locals.messages = msgs;

	  // expose "hasMessages"
	  res.locals.hasMessages = !! msgs.length;

	  /* This is equivalent:
	   res.locals({
	     messages: msgs,
	     hasMessages: !! msgs.length
	   });
	  */

	  // empty or "flush" the messages so they
	  // don't build up
	  req.session.messages = [];
	  next();
	});
	
	// Error Handling
	app.use(function(err, req, res, next){
	  // treat as 404
	  if (~err.message.indexOf('not found')) return next()

	  // log it
	  console.error(err.stack)

	  // error page
	  res.status(500).render('500')
	})

	// assume 404 since no middleware responded
	app.use(function(req, res, next){
	  res.status(404).render('404', { url: req.originalUrl })
	})
	
	app_set_env('SENDGRID_USER')
	app_set_env('SENDGRID_KEY')	
	app.sendgrid  = require('sendgrid')(app.SENDGRID_USER, app.SENDGRID_KEY);
	
	//if ( app.config.sendgrid ) app.sendgrid.send({
	//  to: app.config.contact_mail,
	//  from: 'pat@cappelaere.com',
	//  subject: 'B-CARE Help Desk',
	//  text: 'SCRS startup email through SendGrid'
	//}, function(success, message) {
	//	if (!success) {
	//  	logger.info(message);
	//	} 
	//});
	
	// TWILIO
	app_set_env('TWILIO_ACCOUNT_SID')
	app_set_env('TWILIO_AUTH_TOKEN')
	app.twilio = require('twilio')(app.TWILIO_ACCOUNT_SID, app.TWILIO_AUTH_TOKEN);
	
	// SLIDESHARE
	app_set_env('SLIDESHARE_API_SECRET')
	app_set_env('SLIDESHARE_API_KEY')
	
	// ZENDESK
	app.zendesk = zendesk.createClient({
		username:  app.config.zendesk.email,
		token:     app.config.zendesk.token,
		remoteUri: app.config.zendesk.portal + '/api/v2'
	});
	
	// WISTIA
	app_set_env('WISTIA_API_PASSWORD')
	
	//RECAPTCHA
	//app_set_env('RECAPTCHA_PUBLIC_KEY')
	//app_set_env('RECAPTCHA_PRIVATE_KEY')
	
	// DESK.COM OAUTH
	//app_set_env('BCARE_OAUTH_KEY')
	//app_set_env('BCARE_OAUTH_SECRET')
	//app_set_env('BCARE_OAUTH_TOKEN')
	//app_set_env('BCARE_OAUTH_TOKEN_SECRET')
		
	//OAuth.OAuth.prototype.patch= function(url, oauth_token, oauth_token_secret, post_body, post_content_type, callback) {
	//  return this._putOrPost("PATCH", url, oauth_token, oauth_token_secret, post_body, post_content_type, callback);
	//}
	
    //app.oauth = new OAuth.OAuth(
    //     'https://bcarehelp.desk.com/oauth/request_token',
    //     'https://bcarehelp.desk.com/oauth/access_token',
    //     app.BCARE_OAUTH_KEY,
    //     app.BCARE_OAUTH_SECRET,
    //     '1.0A',
    //     null,
    //     'HMAC-SHA1'
    //   );
	      
	if( process.env.NODE_ENV != 'development') {
		hospitals.sync_with_zendesk();
		users.sync_with_zendesk();
	} else {
		console.log("Starting in", process.env.NODE_ENV)
	}
}
 
