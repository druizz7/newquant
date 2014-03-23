var eyes 		= require('eyes');
var util		= require('util');
var should 		= require('should');
var request 	= require('../support/http');
var superagent 	= require('superagent');

//var host = "http://localhost:5000";
var host = "http://b-care-dev.herokuapp.com";

describe('User Access', function() {
    describe('Unauthenticated User', function(){
		 it('should not have access to Training Materials', function(done){
			 request(host)
			 .get('/training')
			 .expect(302, done)
		 }),
		 it('should not have access to Registration', function(done){
			 request(host)
			 .get('/registration')
			 .expect(302, done)
		 }),
		 it('should not have access to FAQ', function(done){
			 request(host)
			 .get('/faq')
			 .expect(302, done)
		 }),
		 it('should not have access to Help Desk', function(done){
			 request(host)
			 .get('/help_desk')
			 .expect(302, done)
		 }),
		 it('should have access to Contact Us', function(done){
			 request(host)
			 .get('/contact')
			 .expect(200, done)
		 }),
		 it('should not have access to Admin', function(done){
			 request(host)
			 .get('/admin')
			 .expect(404, done)
		 }),
		 it('should not have access to Analytics', function(done){
			 request(host)
			 .get('/admin/analytics')
			 .expect(404, done)
		 })
	}),
    describe('Authenticated User', function(){
		var agent = superagent.agent();
			
		// NOTES:  This requires a user defined in the database with email, is_admin = false, and md5 used as password) 
		
	    before( loginUser(agent, {	'email': 'cappelaere1@me.com',
									'password': 'c405f110171e80205f398418a3e2466d'})),
		
		it('should have access to Training Materials', function(done){
			agent
			 .get(host+'/training').end(function(err, res) {
			 	res.should.have.status(200);
				return done();
			})
		 })

		it('should have access to Registration', function(done){
			agent
			 .get(host+'/registration').end(function(err, res) {
			 	res.should.have.status(200);
				return done();
			})
		 }),
		it('should have access to FAQ', function(done){
			agent
			 .get(host+'/faq').end(function(err, res) {
				res.should.have.status(200);
				return done();
			})
		 }),
		it('should have access to Help Desk', function(done){
			agent
			 .get(host+'/help_desk').end(function(err, res) {
			 	res.should.have.status(200);
				return done();
			})
		 }),
		it('should have access to Contact Us', function(done){
			agent
			 .get(host+'/contact').end(function(err, res) {
			 	res.should.have.status(200);
				return done();
			})
		 }),
		it('should not have access to Admin', function(done){
			 agent.get(host+'/admin').end(function(err, res) {
			 	res.should.have.status(404);
				return done();
			})
		 }),
 		it('should not have access to Analytics', function(done){
 			 agent.get(host+'/admin/analytics').end(function(err, res) {
 			 	res.should.have.status(404);
 				return done();
 			})
 		 })
		 
	}),
    describe('Admin User', function(){
		var agent = superagent.agent();
		
	    before( loginUser(agent, {	'email': 'pat@vightel.com',
									'password': '0552c162f29891329cc271e3e9b44bcc'})),
		
		it('should have access to Training Materials', function(done){
			agent
			 .get(host+'/training').end(function(err, res) {
			 	res.should.have.status(200);
				return done();
			})
		 }),
		it('should have access to Registration', function(done){
			agent
			 .get(host+'/registration').end(function(err, res) {
			 	res.should.have.status(200);
				return done();
			})
		 }),
		it('should have access to FAQ', function(done){
			agent
			 .get(host+'/faq').end(function(err, res) {
			 	res.should.have.status(200);
				return done();
			})
		 }),
		it('should have access to Help Desk', function(done){
			agent
			 .get(host+'/help_desk').end(function(err, res) {
			 	res.should.have.status(200);
				return done();
			})
		 }),
		it('should have access to Contact Us', function(done){
			agent
			 .get(host+'/contact').end(function(err, res) {
			 	res.should.have.status(200);
				return done();
			})
		 }),
		it('should have access to Admin', function(done) {
			 agent.get(host+'/admin').end(function(err, res) {
			 	res.should.have.status(200);
				return done();
			})
		}),
		it('should have access to Analytics', function(done) {
			 agent.get(host+'/admin/analytics').end(function(err, res) {
			 	res.should.have.status(200);
				return done();
			})
		})
	})
	
})

function loginUser(agent, options) {
  return function(done) {
    agent
      .post(host+"/login/auth")
      .send(options)
      .end(onResponse);

    function onResponse(err, res) {
      res.should.have.status(200);
      return done();
    }
  };
}