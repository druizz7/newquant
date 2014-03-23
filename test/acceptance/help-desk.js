var request = require('../support/http');
var eyes 	= require('eyes');
var util	= require('util');
var should 	= require('should');

var host = "http://localhost:5000";

describe('B-CARE Tool Portal', function(){
    describe('Help-Desk', function(){
        it('should allow anyone to access the help desk', function(done){
          request(host)
          .get('/help_desk')
          .expect(200, done);
        }),
        it('Anyone can post a public question', function(done){
          request('https://bcarehelp.desk.com')
          .get('/customer/portal/questions/new')
          .expect(200, done);
        }),
        it('User must select one of our six topics', function(done){
          request('https://bcarehelp.desk.com')
          .get('/customer/portal/questions/new')
	      .end(function(err, res){
			  	res.text.should.include('B-CARE Portal Access');
			  res.text.should.include('B-CARE Tool :: Submission');
			  res.text.should.include('B-CARE Tool :: Training');
			  res.text.should.include('B-CARE Tool :: Policy');
			  res.text.should.include('B-CARE Tool :: Clinical');
			  res.text.should.include('Others');
	        done();
	      })
        }),
        it('Anyone can send an email to us', function(done){
          request('https://bcarehelp.desk.com')
          .get('/customer/portal/emails/new')
          .expect(200, done);
        }),
        it('Anyone can send use Live Chat', function(done){
          request('https://bcarehelp.desk.com')
          .get('/customer/portal/chats/new')
          .expect(200, done);
        }),
        it('Anyone can call help desk @ 888.207.0728', function(done){
          request('https://bcarehelp.desk.com')
          .get('/')
	      .end(function(err, res){
			  res.text.should.include('888.207.0728');
	        done();
	      })
        })
	}),
	describe('Portal needs consistent information with help desk', function(){
		it('Portal must use same phone number 888.207.0728', function(done){
			request(host)
			.get('/contact')
			.end(function(err, res){
				res.text.should.include('888.207.0728');
				done();
			})
	  	}),
		it('Portal must use same support email', function(done){
			request(host)
			.get('/contact')
			.end(function(err, res){
				res.text.should.include('bcare@caretoolsystem.com');
				done();
			})
		})
	})
})
