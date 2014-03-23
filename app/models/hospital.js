var util 		= require('util');
var fs	 		= require('fs');
var path		= require('path');
var eyes		= require('eyes');
var debug		= require('debug')('db');
var unirest		= require("unirest");
var async		= require('async');
//
// list all zendesk hospitals
//
function list_zendesk_hospitals(cb) {
	app.zendesk.organizations.list(function (err, req, result) {
		if (err) {
			logger.error("Error retrieving companies", err.toString())
	    	cb(err, null);
		} else {
			cb(null, result)
		}
	})
}
function list_bcare_hospitals(cb) {
	app.client.query("SELECT * from hospitals;", function(err, result) {
		cb(err, result.rows)
	})
}

function search_hospital(name, cb) {
	console.log("searching:", name)
	app.zendesk.organizations.search({"query": name}, function (err, req, result) {
		if (err) {
			logger.error("Error searching company", name, err.toString())
	    	cb(err, null);
		} else {
			console.log(result[0])
			cb(null, result[0])
		}
	})
}

function update_hospital(h, cb) {
	var desk_data = {
		"organization": {
		"name": 	h.name,
		"organization_fields": 	{	
				"hospital_id":  h.hospital_id,
				"bpid": 		h.bpid
		}}
	}
	
	app.zendesk.organizations.update(h.desk_id, desk_data, function (err, req, result) {
		if( err ) {
			console.log("Error updating:", desk_data.name)
			if(cb) cb(err, null)
		} else {
			console.log("Updated:", desk_data.organization.name)
			if(cb) cb(null, result[0])
		}
	})
}

function create_hospital(h, cb) {
	// update desk database record
	var desk_data = {
		"organization": {
			"name": 	h.name,
			"organization_fields": 	{	
					"hospital_id":  h.hospital_id,
					"bpid": 		h.bpid
			}}
	}
	console.log("Creating", desk_data)
	app.zendesk.organizations.create(desk_data, function (err, req, result) {
		if (err) {
			logger.error("Error creating company", err.toString())
	    	if(cb) cb(err, null);
		} else {
			console.log("Created", util.inspect(result))
			if(cb) cb(null, result)
		}
	})
}

module.exports = {
	// Save a newly created hospital
	save: function(json, cb) {
		console.log("hospital save", json)
		var str 	= "INSERT INTO hospitals ( name, latitude, longitude, image, website, address, state, bpid) ";
		str += "VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING hospital_id;"
		app.client.query(str, 
			[json.name, parseFloat(json.latitude), parseFloat(json.longitude), json.image, json.website, json.address, json.state, json.bpid ], function(err, result) {
				console.log("new insert", err, result)
				if( !err ) {
					var hospital_id = result.rows[0].hospital_id;
					var h = {
						'name': json.name,
						'bpid': json.bpid,
						'hospital_id': hospital_id
					}
					create_hospital(h, function(err, result) {
						var desk_id = result.id
						app.client.query("UPDATE hospitals SET (desk_id ) = ($1) WHERE hospital_id= $2;", 
							[desk_id,hospital_id], 
							function(err, result) {
								console.log(err)
								cb(err)
						})
					})
				} else {
					cb(err)
				}
		})
	},
	
	delete_hospital: function(id, cb) {
		// we need to get the desk_id of that hospital
		app.client.query("SELECT desk_id from hospitals WHERE hospital_id= $1;", [id], function(err, result) {
			var desk_id = result.rows[0].desk_id
			console.log( "Retrieved desk_id", desk_id)
			app.zendesk.organizations.delete(desk_id, function (err, req, result) {
				console.log("desk hospital deleted", err)
				app.client.query("DELETE FROM hospitals WHERE hospital_id= $1;", [id], function(err, result) {
					console.log("Deleted hospital", id, err)
					cb(err)
				})	
			})
		})
	},
	
	// Update hospital
	update: function(h, cb) {
		console.log("update h", h)
		app.client.query("UPDATE hospitals SET (name,latitude,longitude,image,website,address,state,bpid, desk_id ) = ($1, $2, $3, $4, $5, $6, $7, $8, $9) WHERE hospital_id= $10;", 
			[h.name, h.latitude,h.longitude,h.image,h.website,h.address,h.state,h.bpid,h.desk_id,h.hospital_id], 
			function(err, result) {
				console.log("err",err)
				update_hospital(h)
		})
	},

	sync_with_zendesk: function() {
		async.parallel([
			list_zendesk_hospitals,
			list_bcare_hospitals
		], function(err, results) {
			if( !err ) {
				var zendesk_hospitals 	= results[0]
				var bcare_hospitals		= results[1]
			
				// check if we have zendesk hospitals with no hospital_id
				async.each(zendesk_hospitals, function(h,cb) {
					//eyes.inspect(h, "zh")
					if(h.organization_fields.hospital_id == undefined) {
						console.log("Zendesk Hospital ", h.id, h.name, "undefined")
					}
				})
			
				// check if we have bcare hospitals with no zendesk id
				async.each(bcare_hospitals, function(h,cb) {
					if(h.desk_id == undefined) {
						console.log("B-CARE Hospital ", h.id, h.name, "undefined")
					}
				})
			} else{
				console.log("Error syncing hospitals", err)
			}
		})
	},
	
	// Sync with Desk.com
	sync_with_desk: function() {
		list_zendesk_hospitals( function(err, companies) {
			for(var c in companies) {
				var company = companies[c]
				console.log("Got:", company.name)
			}
		})
		
		console.log("Sync hospitals...")
		var query = app.client.query("SELECT * FROM hospitals", function(err, result) {
			if( !err ) {
				var hospitals = result.rows;
				async.each(hospitals, function(h,cb) {
					create_hospital(h, function(err, h) {
						if(!err) {
							h.desk_id = result.id
							app.client.query("UPDATE hospitals SET (desk_id ) = ($1) WHERE hospital_id= $2;", 
								[h.desk_id,h.hospital_id], 
								function(err, result) {
									console.log(err)
							})
							//console.log("update", h.name, h.id, h.desk_id )
						} else {
							//console.log("need to create ", h.name)
						}
					})
				}, function(err) {
					
				})
			}
		})
	}
}