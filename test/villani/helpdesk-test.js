var eyes 		= require('eyes');
var util	      = require('util');
var should 		= require('should');
var request    = require('../support/http');
var superagent = require('superagent');

var host = "http://bcare-test.herokuapp.com";
var knownUserOpts = {'email': 'jim.villani@outlook.com',
							'password': 'b6h94f8y74648473fjm9ncdigqa49w86'};
var adminUserOpts = {'email': 'jim.villani@gmail.com',
							'password': '76q4qeu4ad7r94g4cxvu7jyk63q3yneo'};

var main = function () {
	describe('B-CARE Tool Portal', users);
};


var users = function () {
   describe('Any-User', anyuser),
   describe('Anonymous-User (1)', anonymousUser),
   describe('Known-User (3)', knownUser),
   describe('Admin User', adminUser)
};

var anyuser = function () {
	it('Can access the help desk (1a)', function(done){
		request(host)
		.get('/')
		.end(function(err, res) {
			should.not.exist(err);
			res.status.should.not.be.within(400, 499);
			done();
		});
   }),

   describe('Home-Page-Viewer', function(done) {
		it('Can see Home Page (1b)', function(done){
			request(host).get('/').expect(200, done);
		}),
		it('Can see Econometrica text containing current year (1c.i)', function(done){
			request(host)
			.get('/')
			.end(function(err, res) {
				should.not.exist(err);
				res.text.should.include('Econometrica Inc (c) 2014');
				done();
			})
		}),
		it('Can see link to Privacy Statement (1d)', function(done){
			request(host)
			.get('/')
			.end(function(err, res) {
				should.not.exist(err);
				res.text.should.include('<a href=\'/privacy\'>Privacy Statement</a>');
				done();
			})
		}),

		it('Can click on privacy statement link and see privacy statement (1d)', function(done){
			request(host)
			.get('/privacy')
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.not.be.within(400, 499);
				done();
			});
		}),

		it('Can see link to About Page (1e)', function(done){
			request(host)
			.get('/')
			.end(function(err, res) {
				should.not.exist(err);
				res.text.should.include('<a href="/about">About B-CARE</a>');
				done();
			})
		}),
		it('Can see link to Contact Us Page (1f)', function(done){
			request(host)
			.get('/')
			.end(function(err, res) {
				should.not.exist(err);
				res.text.should.include('<a href="/contact">Contact Us</a>');
				done();
			})
		})
   }),

   describe('About-Page-Viewer', function() {
      it('Can see About Page (1e)', function(done){
			request(host)
			.get('/about')
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.not.be.within(400, 499);
				done();
			});
		})
   }),

	describe('Contact-Us-Page-Viewer', function() {
		it('Can see Contact Us Page (1f), contact phone number (1f.i) and support email address (1f.ii)', function(done){
			request(host)
			.get('/contact')
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.not.be.within(400, 499);
				res.text.should.include('888.207.0728');
				res.text.should.include('bcare@caretoolsystem.com');
				done();
			});
		})
	})

};

var anonymousUser = function () {
	it('Cannot access Training Materials (1g)', function(done) {
			request(host)
			.get('/training')
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(302);
				done();
			});
	}),
	it('Cannot access Registration (1g)', function(done) {
			request(host)
			.get('/registration')
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(302);
				done();
			});
	}),
	it('Cannot access FAQ (1g)', function(done) {
			request(host)
			.get('/faq')
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(302);
				done();
			});
	}),
	it('Cannot access any user profile (1g)', function(done) {
			request(host)
			.get('/users/40')
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.equal(302);
				done();
			});
		}),
	it('Cannot access Slideshare or Wistia documents (1h)', function() {}),
   it('Can create a new account using an email address (1k)', createAccount)

};

var createAccount = function () {
};

var knownUser = function () {
	var agent = superagent.agent();
	before(login(agent, knownUserOpts)),

   it('Can Sign in using Existing Credentials (3a)', function(done) {
		agent
		.get(host + '/').end(function(err, res) {
			res.should.have.status(200);
			done();
		});
   }),

   it('Can view and customize profile information (3b)', function(done){
		agent
		.get(host + '/users/40').end(function(err, res) {
			res.should.have.status(200);
			done();
		});
   }),
	describe('Profile-Customizer (3b.i1)', customizeProfile),

   it('Cannot access any user profiles other than own (3c)', function(done){
		agent
		.get(host + '/users/39').end(function(err, res) {
			res.should.have.status(200);
			(res.redirects[0]).should.equal(host + '/');
			done();
		});
   }),
   it('Can view Training Materials (3d)', function(done){
		agent
		.get(host + '/training').end(function(err, res) {
			res.should.have.status(200);
			done();
		});
   }),
   describe('Training-Materials-Viewer (3d)', viewTrainingMaterials),

   it('Can view future webinars and register for them (3e)', function(done){
		agent
		.get(host + '/registration').end(function(err, res) {
			res.should.have.status(200);
			done();
		});
   }),
   describe('Registrant-User', registration),

   it('Can view FAQ entries (3f)', function(done){
		agent
		.get(host + '/faq').end(function(err, res) {
			res.should.have.status(200);
			done();
		});
   }),
   describe('FAQ-Viewer (3f)', viewFAQs),

   it('Can view Help Desk functions (3g)', function(done){
		agent
		.get(host + '/help_desk').end(function(err, res) {
			res.should.have.status(200);
			done();
		});
   }),
   describe('Help-Desk-Ticket-Creator', createTicket),
   describe('Help-Desk-Ticket-Viewer', viewTickets),
   it('Can only access Slideshare or Wistia documents through website (3h)', function() {}),
   it('Can log out (3i)', function() {})
};

var customizeProfile = function() {
	var agent = superagent.agent();
	before(login(agent, knownUserOpts)),
	it('Must specify First Name (3b.i1)', function(){}),
	it('Must specify Last Name (3b.i2)', function(){}),
	it('Must specify Display Name (3b.i3)', function(){}),
	it('Must specify Phone Number (3b.i4)', function(){}),
	it('Can specify Alternate Phone Number (3b.i5)', function(){}),
	it('Must specify Email Address (3b.i6)', function(){}),
	it('Can specify Facility (3b.i7)', function(){}),
	describe('Facility-Specifier (3b.i7)', function() {
	   it('Should autocomplete after any three letters in name of facility (3b.i7)', function(){
	   })
	})
};

var viewTrainingMaterials = function() {
	var agent = superagent.agent();
	before(login(agent, knownUserOpts)),
   describe('Training-Guide-Viewer (3d.i)', function() {
      it('Can page through and download documents shared from Slideshare/Wistia (3d.i1)', function(){})
   }),
   describe('Awardee-Manual-Viewer (3d.ii)', function() {
      it('Can page through and download documents shared from Slideshare/Wistia (3d.ii1)', function(){})
   }),
   describe('Resources-Viewer (3d.iii)', function() {
      it('Can page through and download documents (3d.iii1)', function(){})
   }),
   describe('Webinar-Material-Viewer (3d.iv)', function() {
      it('Can see past webinar recordings (3d.iv1)', function(){}),
      it('Can see Powerpoint/other materials related to webinars (3d.iv2)', function(){})
   })
};

var registration = function() {
	var agent = superagent.agent();
	before(login(agent, knownUserOpts)),
	it('Can see calendar for B-CARE Webinar for Training Orientation (3e.i)', function(done){
		agent
		.get(host + '/calendar/1').end(function(err, res) {
			res.should.have.status(200);
			done();
		});
   }),
	it('Can see calendar for Introduction to B-CARE Assessment Tool Training (3e.i)', function(done){
		agent
		.get(host + '/calendar/2').end(function(err, res) {
			res.should.have.status(200);
			done();
		});
   }),
	it('Can see calendar for B-CARE IT Training (3e.i)', function(done){
		agent
		.get(host + '/calendar/3').end(function(err, res) {
			res.should.have.status(200);
			done();
		});
   }),
	it('Monthly B-CARE Coordinator Bridge Calls (3e.i)', function(done){
		agent
		.get(host + '/calendar/4').end(function(err, res) {
			res.should.have.status(200);
			done();
		});
   }),
	it('Discussion Forums (3e.i)', function(done){
		agent
		.get(host + '/calendar/5').end(function(err, res) {
			res.should.have.status(200);
			done();
		});
   }),
	it('Can see combined calendar (3e.ii)', function(done){
		agent
		.get(host + '/calendar').end(function(err, res) {
			res.should.have.status(200);
			done();
		});
   }),
	it('Can click on a webinar calendar event entry (3e.iii)', function(){}),
	describe('Webinar-Calendar-Event-Viewer', function() {
		it('Can see details of event (3e.iii)', function(){}),
		it('Can register for the event (3e.iv)' , function(){})
	})
};

var viewFAQs = function() {
	var agent = superagent.agent();
	before(login(agent, knownUserOpts)),
   it('Can search for content from main FAQ page (3f.i)', function(){}),
   it('Can search for content from FAQ article page (3f.i)', function(){}),
   it('Cannot see Community section (3f.ii)', function(){}),
   it('Cannot see Announcements section (3f.ii)', function(){}),
   it('Can click on entries to view articles (3f.iii)', function() {}),
   it('Cannot rate articles as helpful/unhelpful (3f.iii1)', function() {}),
   it('Cannot add a comment to article (3f.iii2)', function() {}),
   it('Cannot see or use any social media integration aspects (3f.iii3)', function() {}),
   it('Can add comment (3f.iv)', function() {}), /* does this conflict with 3f.iii2? */
   it('Cannot see news (3f.v)', function() {}),
   it('Cannot see community/discussion topics (3f.vi)', function() {})
};

var createTicket = function() {
	var agent = superagent.agent();
	before(login(agent, knownUserOpts)),
	it('Can create a new ticket (3g.i)', function(done){
		agent
		.get(host + '/help_desk/new_ticket').end(function(err, res) {
			res.should.have.status(200);
			done();
		});
   }),
	it('Must specify Topic, Title, Description (3g.i1)', function() {}),
	it('Cannot specify priority or urgency (3g.i2)', function() {})
};

var viewTickets = function() {
	var agent = superagent.agent();
	before(login(agent, knownUserOpts)),
	it('Can View own Tickets (3g.ii)', function () {}),
	it('Can View Ticket Status/Content (3g.ii)', function () {}),
	it('Cannot view other users’ tickets (3g.iii)', function () {}),
	it('Can Receive email confirmation of activity on his tickets (3g.iv)', function () {}),
	it('Can request call back (3g.v)', function () {})
};

var adminUser = function() {
	describe('Admin User', function(){

		var agent = superagent.agent();
		before(login(agent, adminUserOpts)),

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
};


var login = function(agent, options) {
	return function(done) {
		agent
		.post(host + '/login/auth')
		.send(options)
		.end(function (err, res) {
			res.should.have.status(200, err);
			return done();
		});
	};
};


{
	main();
}