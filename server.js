/**
 * Module dependencies.
 */

var newrelic        = require('newrelic'),
	express 		= require('express'),
	path			= require('path'),
	util			= require('util'),
	fs				= require('fs'),
  	debug 			= require('debug')('server'),
	eyes			= require('eyes'),
	//passport 		= require('passport'),
	//Localtrategy 	= require('passport-local').Strategy,
	//BasicStrategy = require('passport-http').BasicStrategy,
	
	home			= require('./app/controllers/home'),
	materials		= require('./app/controllers/materials'),
	//admin			= require('./app/controllers/admin'),
	login			= require('./app/controllers/login'),
	test			= require('./app/controllers/test'),
	admin			= require('./app/controllers/admin'),
	users			= require('./app/controllers/users'),
	hospitals		= require('./app/controllers/hospitals'),
	feedback		= require('./app/controllers/feedback'),
	twilio			= require('./app/controllers/twilio'),
	twiml			= require('./app/controllers/twiml'),
	persona			= require('./app/controllers/persona'),
	User			= require('./app/models/user.js'),
	help_desk		= require('./app/controllers/helpdesk')
	;
		
var app = module.exports = express();

global.app 			= app;
app.root 			= process.cwd();

var mainEnv 		= app.root + '/config/environment'+'.js';
var supportEnv 		= app.root + '/config/environments/' + app.settings.env+'.js';

require(mainEnv)
require(supportEnv)

// load settings
require('./settings').boot(app)  

// load controllers
require('./lib/boot')(app, { verbose: !module.parent });

// =========================================
// ROUTING
//


function auth(req, res, next) {
	if (req.session && req.session.user) { 
		return next();
	}
	res.redirect('/')
}

function must_be_admin(req, res, next) {
	var user = req.session.user;
	
	if (user && user.is_admin) { 
		return next();
	}
	
	res.send(404)
}
// Home page -> app
app.get('/',									home.index);
app.get('/about',								home.about);
app.get('/contact',								home.contact);
app.get('/privacy',								home.privacy);
app.get('/faq',									auth, help_desk.faq);
app.get('/registration',						auth, home.registration);
app.get('/calendar',							auth, home.calendar);
app.get('/calendar/:id',						auth, home.calendar);

app.get('/trainers',							auth, home.trainers);
app.get('/training',							auth, home.training);
app.get('/blog',								auth, home.blog);

app.get('/materials/videos',					auth, materials.videos);
app.get('/materials/wistia',					auth, materials.wistia);
app.get('/materials/:id',						auth, materials.index);

app.get('/twilio',								auth, twilio.index);
app.get('/twilio/call_helpdesk',				auth, twilio.call_helpdesk);
app.get('/twilio/call_browser',					auth, twilio.call_browser);
app.get('/twilio/call_record',					auth, twilio.call_record);

app.all('/twiml/voice_url',						auth, twiml.voice_url);
app.all('/twiml/voice_fallback_url',			auth, twiml.voice_fallback_url);
app.all('/twiml/voice_status_callback_url',		auth, twiml.voice_status_callback_url);
app.all('/twiml/sms_url',						auth, twiml.sms_url);
app.all('/twiml/sms_fallback_url',				auth, twiml.sms_fallback_url);
app.all('/twiml/sms_status_callback_url',		auth, twiml.sms_status_callback_url);

app.get('/admin',								must_be_admin, admin.index);

app.get('/users',								must_be_admin, users.users);
app.get('/users/:id',							auth, users.user_edit);
app.post('/users/:id',							auth, users.user_update);
app.delete('/users/:id',						must_be_admin, users.user_delete);

app.get('/hospitals',							must_be_admin, hospitals.hospitals);
app.post('/hospitals',							must_be_admin, hospitals.hospital_new);
app.get('/hospitals/new',						must_be_admin, hospitals.hospital_new);
app.get('/hospitals/:id',						auth, hospitals.hospital_edit);
app.post('/hospitals/:id',						auth, hospitals.hospital_update);
app.delete('/hospitals/:id',					must_be_admin, hospitals.hospital_delete);
app.post('/hospitals/:id/delete',				must_be_admin, hospitals.hospital_delete);

app.get('/admin/analytics',						must_be_admin, admin.analytics);
app.get('/admin/dbcheck',						must_be_admin, admin.dbcheck);

app.post('/feedback',							auth, feedback.index);
app.get('/test/:id', 							auth, test.index);

app.post('/login',								login.login);
app.get('/login/activate',						login.activate);
app.post('/login/auth',							login.auth);

app.get('/faq',									auth, help_desk.help_desk);

app.get('/help_desk',							auth, help_desk.help_desk);

app.get('/help_desk/new_ticket',				auth, help_desk.new_ticket);
app.get('/help_desk/new_question',				auth, help_desk.new_question);
app.post('/help_desk/submit_anon_ticket',		auth, help_desk.submit_anon_ticket);
app.post('/help_desk/submit_ticket',			auth, help_desk.submit_ticket);
app.post('/help_desk/submit_question',			auth, help_desk.submit_question);
app.get('/help_desk/ticket/:id',				auth, help_desk.show_ticket);
app.get('/help_desk/tickets',					auth, help_desk.show_tickets);
app.get('/help_desk/screensteps',				auth, help_desk.screensteps);
app.get('/help_desk/chat',						auth, help_desk.chat);

// Persona login from sandbox
app.get('/login', function (req, res) {
	var errors	= req.flash('error')
	var q 		= req.query['return_to'] || '/'
	console.log("persona login & return_to:", q)
	res.render('login/persona', { 
			layout: 	false, 
			user: 		req.user,
			errors: 	errors,
			return_to: 	q
		});
});

// Singly login
//app.get('/login', function (req, res) {
//	var errors = req.flash('error')
//	debug("Singly Login...", errors)
//	res.render('login/singly_login', { 
//		layout: 	false, 
//		user: 		req.user,
//		errors: 	errors
//	});
//});

app.get("/logout",								persona.logout);

//app.get('/logout', function(req, res){
//	console.log("logout")
//	delete req.session.user;
//	req.session.user = undefined
//	req.logout();
//	delete req.headers.cookie
	
	// Check where we come from to avoid redirect
//	console.log(req.headers)
	
	// logout from zendesk as well
	//var url 	= 'https://'+ app.config.zendesk.subdomain + '.zendesk.com/access/logout'
	//console.log("redirect to ", url)
	//res.redirect(url);
//	res.redirect("/")
//});

app.post('/persona/verify',					persona.verify);
app.all('/persona/logout',					persona.logout);
   
// GET /auth/singly/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.

//app.get('/auth/singly/callback', function(req, res, next) {
//	passport.authenticate('singly', {
//		session: true,
//		failureRedirect: '/login',
//		successReturnToOrRedirect: '/'
//	}, function(err, user, info){
//		if( err === null ) {
//			logger.info("singly auth user:", util.inspect(user))
//			//req.session.user = user
//			if( user ) {
//				User.save(user, function(err, u) {
//					debug("/auth/singly/callback")
//					if( u.email === 'undefined' || u.phone === 'undefined') {
//						logger.info("Missing email... redirect to profile")
//						req.flash("error",'Missing phone number and/or email address')
//						res.redirect("/admin/user/"+user.id)
//					} else {
//						logger.info("Storing u in session:", u)
//						req.session.user = u
//						res.redirect("/")				
//					}
//				})
//			} else {
//				res.redirect('/login')				
//			}
//		} else {
//			res.redirect('/login')
//		}
//	})(req,res,next)
//});
	//}, function(err, user, info) {
	//	try {
	//	console.log("After /auth/singly/:callback " );
		//req.session.user = user
	//	return next(err)
	//	} catch(e) { console.log("Exception:", e); }
	//})
	//next(0)
	//});

// GET /auth/singly
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Singly authentication will involve
//   redirecting the user to api.singly.com.  After authorization, Singly will
//   redirect the user back to this application at /auth/singly/callback
//app.get('/auth/singly/:service', passport.authenticate('singly'));

//app.get('/auth/singly/:service', function(req, res, next) {
//	console.log("/auth/singly/:service ")
//	passport.authenticate('singly', function(err, user, info) {
//		console.log("After authenticate /auth/singly/:service ")
//		next(err)
//	})
//});


// ===========================================================
// port set based on NODE_ENV settings (production, development or test)
debug("trying to start on port:"+ app.get('port'));

if (!module.parent) {
	app.listen(app.get('port'));
	
	logger.info( "**** "+app.config.application+' started on port:'+app.get('port'));
}