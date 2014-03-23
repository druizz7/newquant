var util	= require('util'),
	und		= require('underscore'),
	eyes	= require('eyes'),
	path	= require('path'),
	fs		= require('fs'),
	User	= require('../../app/models/user'),
	Hospital = require('../../app/models/hospital'),
	debug	= require('debug')('admin');
	
	
module.exports = {
	hospitals: function(req, res) {
		var user = req.session.user;
		var query = "SELECT * from hospitals"
		app.client.query(query, function(err, result) {
			if( err ) {
				logger.error("Query error:", err);
			}
			var hospitals = result.rows
		
			res.render( 'hospitals/hospitals', 
				{	layout: 'admin_layout.ejs',
					menu: '#hospitals_menu',
					user: user,
					hospitals: und.sortBy(hospitals, function(e) { return e.name })
				});		
		})
	},
	
	hospital_new: function(req, res) {
		var user 	= req.session.user;

		if( !user.is_admin ) {
			return res.redirect("/")
		}
		
		if( req.method === 'GET') {
			res.render( 'hospitals/hospital_new', 
				{	layout: 'admin_layout.ejs',
					menu: 	'#hospitals_menu',
					user: 	user
				});					
		} else {	// create a new one
			Hospital.save(req.body, function(err) {
				if( !err ) {
					res.redirect( '/hospitals' )
				} else {
					res.send("Err creating hospital:"+err)
				}
			})
		}
	},

	hospital_edit: function(req, res) {
		var user 	= req.session.user;
		var id		= req.params['id']
		
		if( user.is_admin ) {
			var query 	= "SELECT * from hospitals where hospital_id='"+id+"'"
			app.client.query(query, function(err, result) {			
				if( !err && result.rows[0]) {
					var hospital = result.rows[0]
					eyes.inspect(hospital, "hospital")
					res.render( 'hospitals/hospital_edit', 
					{	layout: 'layout.ejs',
						menu: '#hospital_edit_menu',
						user: user,
						hospital: hospital
					});		
				} else {
					res.send("Hospital Edit Error:", err)
				}
			})
		} else {
			console.log("Need to be admin to edit hospital")
			res.redirect("/")
		}
	},
	
	hospital_update: function(req, res) {
		var user 			= req.session.user;
		if( user && user.is_admin) {
			var h = req.body
			Hospital.update(h, function() {
				res.redirect('/hospitals')
			})			
		} else {
			res.redirect("/")			
		}
	},
	
	hospital_delete: function(req, res) {
		console.log("hospital_delete")
		var user 	= req.session.user;
		if( user && user.is_admin) {
			var id = req.params['id']
			console.log("deleting", id)
			Hospital.delete_hospital(id, function(err) {
				res.send(200)				
			})
		} else {
			console.log("not admin")
			res.redirect("/hospitals")
		}
	}
};