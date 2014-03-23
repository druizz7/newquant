var util 		= require('util');
var fs	 		= require('fs');
var path		= require('path');
var eyes		= require('eyes');
var debug		= require('debug')('tests');

module.exports = {
	// Test
	index: function(req, res) {       
		var id = req.params['id'];
		
		var query = "SELECT * FROM keys where key='"+id+"'";
		logger.info(query)
		app.client.query(query, function(err, result) {
			if( !err) {
				var record 	= result.rows[0];
				var site_id = record.id;
				
				var query = "SELECT * FROM users";
				app.client.query(query, function(err, result) {
					if( !err) {
						var users = result.rows;
						for( var u in users ) {
							if( users[u].site_id === site_id ) {
								logger.info("Testing as site:", site_id);
								
								res.redirect("/")
							}
						}
					}
				})
			} else {
				logger.info(err)
			}
		})
	},
	
	test: function(req, res) {       

	}
};