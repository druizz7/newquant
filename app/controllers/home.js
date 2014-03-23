var util		= require('util'),
	async		= require('async'),
	eyes		= require('eyes'),
	fs			= require('fs'),
	//nodeDesk	= require('desk'),
	moment		= require('moment'),
	debug		= require('debug')('home');
	
	function incomplete_user(user) {
		if( user.phone == undefined || 
			user.phone == null ||
			user.email == undefined || 
			user.email == null || 
			user.first_name == undefined || 
			user.first_name == null || 
			user.last_name == undefined ||
			user.last_name == null) {
				return true
			} else {
				return false
			}
	}
	
module.exports = {
	about: function(req, res) {
		var user = req.session.user;
		res.render( 'home/about', 
			{	layout: 'layout.ejs',
				menu: '#about_menu',
				user: user,
				config: app.config });
	},
	
	contact: function(req, res) {
		var user = req.session.user;
		res.render( 'home/contact', 
			{	layout: 'layout.ejs',
				menu: '#contact_menu',
				user: user });
	},
	
	privacy: function(req, res) {
		var user = req.session.user;
		res.render( 'home/privacy', 
			{	layout: 'layout.ejs',
				menu: "#privacy_menu",
				user: user
			});
	},
	
	index: function(req, res) {
		var user = req.session.user;
		debug("home index", util.inspect(user))
		if( user && incomplete_user(user)) {
			res.redirect("/users/"+user.user_id)
		} else {
			res.render( 'home/index', 
			{	layout: 'layout.ejs',
				menu: '#home_menu',
				user: user,
				config: app.config
			});
		}
	},
	
	trainers: function(req, res) {
		var user = req.session.user;
		res.render( 'home/trainers', 
			{	layout: 'layout.ejs',
				menu: '#trainers_menu',
				user: user
			});
	},

	training: function(req, res) {
		var user = req.session.user;
		res.render( 'home/training', 
			{	layout: 'layout.ejs',
				menu: '#training_menu',
				user: user,
				config: app.config
			});
	},
	
	faq: function(req, res) {
		var user = req.session.user;
		res.render( 'home/faq', 
			{	layout: 'layout.ejs',
				menu: '#faq_menu',
				user: user
			});
	},

	registration: function(req, res) {
		var user = req.session.user;
		res.render( 'home/registration', 
			{	layout: 'layout.ejs',
				menu: '#registration_menu',
				user: user 
			});
	},
	
	calendar: function(req, res) {
		var user = req.session.user;
		var id	 = req.params['id']
		var view = 'home/calendar'
		
		if( id != undefined ) view += id
		
		res.render( view, 
			{	layout: 'layout.ejs',
				menu: '#registration_menu',
				user: user 
			});
	},
	
	blog: function(req, res) {
		var user = req.session.user;
		res.render( 'home/blog', 
			{	layout: 'layout.ejs',
				blog: app.config.blog,
  				menu: '#blog_menu',
				user: user
			 });
	}
};