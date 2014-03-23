var request = require('../support/http');
var eyes 	= require('eyes');
var util	= require('util');
var should 	= require('should');
var Browser     = require('zombie');

var host = "http://b-care-dev.herokuapp.com";
// force the test environment to 'test'
process.env.NODE_ENV = 'test';
// get the application server module
var app = require('../../server');

//var browser = new Browser({ site: host});

//Notes:  Are we going to have a before() and after() to start the server?  I don't think so;
//We'd have to have the stupid things inside of every describe block--why?  Just make sure the server
//is started in another console window before testing.  And that's even if we test locally; right now
//we are testing remotely only.

describe('Contact Page', function(){
    before(function(){
	this.browser= new Browser({ site: 'http://b-care-dev.herokuapp.com' });
    });
    //Why is this a separate thing?
    before(function(done){
	this.browser.visit('/contact', done);
    });
    it('should show a contact form', function(){
      assert.ok(this.browser.success);
      //assert.equal(this.browser.text, 'Toll Free: 888.207.0728');
      //assert.equal(this.browser.text, 'Econometrica Inc. 7475 Wisconsin Avenue Suite 1000 Bethesda, MD 20814');
    });
})
