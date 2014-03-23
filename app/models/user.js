var util 		= require('util');
var fs	 		= require('fs');
var path		= require('path');
var eyes		= require('eyes');
var request		= require('request');
var unirest		= require("unirest");
var async		= require('async');
var debug		= require('debug')('db');

//	=========================
//
//
function list_zendesk_customers(cb) {
	app.zendesk.users.list( function(err, req, result) {
		if( err) {
			cb(err, null)
		} else {
			cb(err, result)
		}
	})
}
// returns hash of records and emails to help the sync
function list_bcare_customers(cb) {
	app.client.query("SELECT user_id, displayname, email, desk_id from USERS", function(err, result) {
		if( !err ) {
			// build a hash from emails
			var emails = {}
			var ids    = {}
			
			for( var r in result.rows ) {
				var row = result.rows[r]
				emails[row.email] 	= row.user_id
				ids[row.user_id] 	= row
			}
			var results = {
				records: ids,
				emails: emails
			}
			cb(err, results)
		} else {
			cb(err, null)
		}
	})
}

//	=========================
//
//
function update_local_record(json, cb) {
	console.log("Update local record ", json)
	app.client.query("UPDATE users SET (is_admin, is_banned, email, phone, alternate_phone, hospital_id, desk_id, first_name, last_name, displayname, gravatar) = ($1, $2, $3, $4, $5, $6,$7,$8,$9,$10, $11) WHERE user_id= $12;", 
			[json.is_admin, json.is_banned, json.email, json.phone, json.alternate_phone, json.hospital_id, json.desk_id, json.first_name, json.last_name, json.displayname, json.gravatar, json.user_id], function(err, result) {
				console.log("update_local_record", err)
				cb(err)
	})
}

//	=========================
//
//
function search_desk_customer_by_email(email, cb) {
	app.zendesk.users.search( {"query": email} , function(err, req, result) {
		if( err) {
			console.log("Error search user by email", err.toString())
			cb(err, null)
		} else {
			console.log("found desk user", result)
			cb(err, result[0])
		}
	})
}

//	========================================================
//	User modified his record... let's update the desk.com db
//
function patch_desk_record(desk_id, desk_data, cb) {
	console.log("Patching desk id", desk_id, desk_data)
	app.zendesk.users.update( desk_id, desk_data, function(err, req, result) {
		if( err) {
			console.log("Error updating user ", err.toString())
			cb(err, null)
		} else {
			console.log("Desk Patch Complete")
			if(cb) cb(err, result[0])
		}
	})
}

// =====================================
// Create a new desk.com customer record
//
function create_desk_record(desk_data, cb) {
	console.log("Creating desk.com record")
	app.zendesk.users.create( desk_data, function(err, req, result) {
		console.log("app.zendesk.users.create:", err, result)
		if( err) {
			console.log("Error updating user ", err.toString())
			cb(err, null)
		} else {
			eyes.inspect(result, "app.zendesk.users.create result")
			cb(err, result[0])
		}
	})
}

// ===========================================================
module.exports = {
	
	// Started working with this...
	//
	sync_with_zendesk: function(cb1) {
		console.log("sync_with_zendesk")
		async.parallel([
			list_zendesk_customers,
			list_bcare_customers
		], function(err, results) {
			if( err || results == undefined ) {
				logger.error("Error syncing with Zendesk:", err)
				return cb1(err, "")
			}
			//eyes.inspect(results, "results")
			
			var zendesk_records = results[0]
			var emails 			= results[1].emails
			var bcare_records 	= results[1].records
			var html			= ""
				
			async.each(zendesk_records, function(zr, cb2) {
				var str = ""
				var z_user_id = zr.user_fields.user_id
				//eyes.inspect(zr, "zr")
				if( zr.user_fields.user_id == undefined ) {
					str = "Please create record for " + zr.name + " id:" + zr.id;
					logger.info(str)
					html += str + "<br/>";
				} else if (bcare_records[z_user_id] ) {
					if( bcare_records[z_user_id].desk_id != zr.id){
						str = "record mismatched id:" + zr.id +", zendesk user_id:" + z_user_id + ", our zendesk id:" + bcare_records[z_user_id].desk_id
						logger.info(str)
						html += str + "<br/>"
						app.client.query("UPDATE users SET (desk_id ) = ($1) WHERE user_id = $2;", 
							[zr._id,z_user_id], function(err, result) {
								str = "Record "+z_user_id+ "has been updated... please check it. Err:"+err
								logger.info(str)
								html += str + "<br/>"
						})
					} else {
						logger.info("Record in sync", zr.id, z_user_id, bcare_records[z_user_id].displayname)
					}
				}
				cb2()
			}, function(err) {
				console.log("sync done err:", err)
				if( cb1 ) {
					cb1(err, html)
				}
			})
		})
	},
	findByEmail: function(email, cb) {
		var query = app.client.query("SELECT * FROM users where email= $1", [email], function(err, result) {
			//console.log("findByEmail", err, result.rows[0])
			if( err === null ) {
				return cb(null, result.rows[0] )
			} else {
				return fn(err, result)
			}
		})
	},
	
	findHospital: function(id, cb) {
		var query = app.client.query("SELECT name, bpid FROM hospitals where hospital_id= $1", [id], function(err, result) {
			if( err == null ) {
				return cb(null, result.rows[0] )
			} else {
				return fn(err, result)
			}
		})
	},
	// ====================================
	// Retrieve all users in local database
	//
	all: function(cb) {
		var query = app.client.query("SELECT * FROM users", function(err, result) {
			if( !err ) {
				cb(err, result.rows)
			}
		})
	},
	
	// =====================================
	// Update local database and desk.com db
	//
	update: function(json, cb) {
		var desk_data = {
			"user": {
				"name": 		json.displayname,
				"email": 		json.email,
				"phone": 		json.phone,
				"external_id":  json.user_id,
				"user_fields": {
					"user_id": json.user_id
				}
			}
		}
		console.log("Model Update user", desk_data)
		console.log("Model Update user Deskid", json.desk_id)
		
		async.parallel([
			function( cb ) {
				if( json.hospital_id == 'null' || json.hospital_id == '') {
					desk_data.organization_id = undefined
					cb(null, undefined)
				} else {
					// get the hospital name and set the desk_data record
					app.client.query("SELECT name, desk_id from hospitals where hospital_id = $1",[json.hospital_id], function(err, result) {
						if( !err ) {
							//debug("SELECT ERR:", err)
							desk_data.organization_id = result.rows[0].desk_id
							cb(null, desk_data.organization_id)
						} else {
							console.log("Error query hospital", err)
							cb(err, null)
						}
					})
				}
			},
			function( cb ) {
				// search for an existing desk record
				search_desk_customer_by_email(json.email, function(err, entries) {
					console.log("search_desk_customer_by_email returns:", json.email, util.inspect(entries))
					cb(err, entries)
				})
			}
		], function(err, results) {
			console.log("update async err:", err)
			if( err ) {
				return cb(err, null)
			}
			eyes.inspect(results, "update results")
			console.log("json.desk_id:", json.desk_id)
			try{
				if( (json.desk_id != undefined) && (json.desk_id != 'null') && (json.desk_id != null) ) {
					// existing match... patch as necessary
					console.log("match and patch")
					patch_desk_record(json.desk_id, desk_data)
					update_local_record(json, cb)
				} else {
					console.log("create or update...")
					// check if we have to create a record or update an existing one
					var entry = results[1]
					if( entry != undefined) {
						console.log("Found desk user...")
						entry.user_fields['user_id'] = json.user_id
					
						// find the desk id
						var desk_id		= entry.id
						console.log("desk_id user_id", desk_id, json.user_id)

						json.desk_id	= desk_id
										
						patch_desk_record(desk_id, desk_data)
						update_local_record(json, cb)
					} else {
						// create it
						console.log("desk user not found, create it...")
						create_desk_record(desk_data, function(err, result) {
							console.log("create_desk_record", err, result)
							if( !err && result != undefined ) {
								var desk_id		= result.id
								json.desk_id	= desk_id
								console.log("created zendesk id", desk_id)
							}
							update_local_record(json, cb)
						})
					}
				}
			} catch(e) { logger.error("Exception:", e)}
		})
	},
	
	// Save user in Postgres Database
	save: function(json, cb ) {       
		logger.info( "saving user %j", json)
		// check if it exists
		var query = app.client.query("SELECT * FROM users where singly_id= $1", [json.singly_id], function(err, result) {
			debug("query err: ", err)
			if( !err && result.rows[0]== undefined) {
				debug("inserting new user...")
				json.is_admin 	= false;
				json.is_banned 	= false;

				if( (json.gravatar === undefined) || (json.gravatar === 'undefined')) {
					json.gravatar = '/img/no_gravatar.png'
				}

				if( (json.first_name === undefined) || (json.first_name === 'undefined')) {
					json.first_name = "First Name"
				}

				if( (json.last_name === undefined) || (json.last_name === 'undefined')) {
					json.last_name = "Last Name"
				}
				
				if( (json.displayname === undefined) || (json.displayname === 'undefined')) {
					json.displayname = json.email.split('@')[0]
				}
				
				for( email in app.config.admins ) {
					if( app.config.admins[email] === json.email) {
						debug("Admin user")
						json.is_admin = true;
						break;
					}
				}

				var str = "INSERT INTO users( singly_id, first_name, last_name, displayname, email, gravatar, is_admin, is_banned) ";
				str += "VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING user_id;"
				
				console.log(str)
				
				app.client.query(str, 
					[json.singly_id, json.first_name, json.last_name, json.displayname, json.email, json.gravatar, json.is_admin, json.is_banned ],
					function(err, result) {
						console.log("user insert:", err);
						//eyes.inspect(result, "result")
						if( !err ) {
							json.user_id = result.rows[0].user_id
						}
						cb(err, json)
					})
			} else {
				// user exists so check if admin or banned
				var user 		= result.rows[0]
				
				//json.is_admin 	= user.is_admin
				//json.is_banned 	= user.is_banned
				
				debug("user exists:", user)
				cb(null, user)
			}
		});
	},
};