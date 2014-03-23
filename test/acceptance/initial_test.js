var request = require('../support/http');
var eyes 	= require('eyes');
var util	= require('util');
var should 	= require('should');

var host = "http://b-care-dev.herokuapp.com";

//Notes:  Are we going to have a before() and after() to start the server?  I don't think so;
//We'd have to have the stupid things inside of every describe block--why?  Just make sure the server
//is started in another console window before testing.  And that's even if we test locally; right now
//we are testing remotely only.

describe('User Access', function(){
    it('should allow anyone to access the help desk (about page)', function(done){
      request(host)
      .get('/')
      .expect(200, done);
    }),
    it('should allow anyone to access the contact page', function(done){
      request(host)
      .get('/contact')
      .expect(200, done);
    }),
    //initially we were expecting 404, we need anything BUT 200.
    it('should NOT allow anonymous user to access the Training Material page', function(done){
      request(host)
      .get('/training')
      .expect(302, done);
    }),
    it('should NOT allow anonymous user to access the registration page', function(done){
      request(host)
      .get('/registration')
      .expect(302, done);
    }),
    it('should NOT allow anonymous user to access the FAQ page', function(done){
      request(host)
      .get('/faq')
      .expect(302, done);
    }),
    it('should NOT allow anonymous user to access the Help Desk page', function(done){
      request(host)
      .get('/help_desk')
      .expect(302, done);
    })
})

function check200(res){
    if (res.status== 200) throw new Error("Response status shouldn't be 200!!!");
    else return 0;
}
