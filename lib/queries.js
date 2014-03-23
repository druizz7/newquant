var util 		= require('util');
var fs	 		= require('fs');
var path		= require('path');
var debug		= require('debug')('tests');

module.exports = {
	//
	// Retrieve all domains
	//
	getDomains: function( fn ) {
		var query = "SELECT * from domains order by id "
		logger.info(query) 
		app.client.query(query, function(err, result) {
			fn(err, result.rows)
		})
	},
	//
	// Retrieve all measures
	//
	getMeasures: function( fn ) {
		var query = "SELECT * from measures"
		logger.info(query) 
		app.client.query(query, function(err, result) {
			fn(err, result.rows)
		})
	},
	//
	// Retrieve specific all sites
	//
	 getSites: function( fn ) {
		var query = "SELECT * from sites"
		logger.info(query) 
		app.client.query(query, function(err, result) {
			fn(err, result.rows)
		})
	},
	//
	// Retrieve specific site for id
	//
	getSite: function( id, fn ) {
		var query = "SELECT * from sites where id="+id
		logger.info(query) 
		app.client.query(query, function(err, result) {
			fn(err, result.rows[0])
		})
	},
	//
	// Retrieve specific measure for site_id, year and quarter
	//
	get_by_site_measure_year_quarter: function(s_id, m_id, year, quarter, fn ) {
		var query = "SELECT * from by_site_measure_year_quarter where measure_id="+m_id
		query += " and (site_id ="+s_id+")"
		query += " and (year ="+year+")"
		query += " and (quarter ="+quarter+")"
		logger.info(query) 
		app.client.query(query, function(err, result) {
			fn(err, result.rows[0])
		})
	}
};