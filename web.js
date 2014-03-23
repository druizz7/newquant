//web.js

var express = require("express");
var logfmt  = require("logfmt");
var app     = express();

app.use(logfmt.requestLogger());

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
app.get('/registration',						auth, home.registration);
app.get('/calendar',							auth, home.calendar);

app.get('/trainers',							auth, home.trainers);
app.get('/training',							auth, home.training);
app.get('/blog',								auth, home.blog);

app.get('/materials/videos',					auth, materials.videos);
app.get('/materials/:id',						auth, materials.index);


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

app.get("/logout",								persona.logout);



app.post('/persona/verify',					persona.verify);
app.all('/persona/logout',					persona.logout);
   

// port set based on NODE_ENV settings (production, development or test)
debug("trying to start on port:"+ app.get('port'));

if (!module.parent) {
	app.listen(app.get('port'));
	
	logger.info( "**** "+app.config.application+' started on port:'+app.get('port'));
}




var port = Number(process.env.PORT || 5000);
app.listen(port, function(){
  console.log("Listening on "+ port);
});
