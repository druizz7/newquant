var util	= require('util'),
	und		= require('underscore'),
	eyes	= require('eyes'),
	path	= require('path'),
	fs		= require('fs'),
	User	= require('../../app/models/user'),
	debug	= require('debug')('admin');
	
	
module.exports = {
	index: function(req, res) {
		debug('admin/index');
		var user 	= req.session.user; 
		if( !user.is_admin ) {
			console.log("User not admin... redirect")
			return res.send(404)
		}
		
		res.render( 'admin/index', 
			{	layout: 'admin_layout.ejs',
				menu: 	'#admin_menu',
				user: 	user,
				zendesk: app.config.zendesk.portal
			});		
	},
	
	agent: function(req, res) {
		var user 	= req.session.user;
		if( !user.is_admin ) {
			console.log("User not admin... redirect")
			return res.send(404)
		}
		
		var payload = {
		    iat: (new Date().getTime() / 1000),
		    jti: uuid.v4(),
		    name: user.displayname,
		    email: user.email
		};
		console.log("payload", payload)
		
	    var token 	= jwt.encode(payload, app.config.zendesk.sso_token);
		var url 	= 'https://'+ app.config.zendesk.subdomain + '.zendesk.com/access/jwt?jwt='+token
		console.log(url)
		
		res.writeHead(302, {
		    'Location': url
		  });
		res.end();
		return
	},
	
	analytics: function(req, res) {
		var user = req.session.user;
		if( !user.is_admin ) {
			console.log("User not admin... redirect")
			return res.send(404)
		}
		
		res.render( 'admin/analytics', 
			{	layout: 'admin_layout.ejs',
				menu: '#analytics_menu',
				user: user
			});		
		
	},
	dbcheck: function(req, res) {
		console.log("dbcheck...")
		var user 	= req.session.user; 
		
		User.sync_with_zendesk( function(err, html) {
			console.log("sync results:", err)
			res.render('admin/dbcheck',
				{
					layout: 'admin_layout.ejs',
					menu: 	'#dbcheck_menu',
					html: 	html,
					user: user
				})
		});		
	}
};