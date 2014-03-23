var util		= require('util'),
	async		= require('async'),
	eyes		= require('eyes'),
	fs			= require('fs'),
	nodeDesk	= require("desk"),
	unirest		= require("unirest"),
	_			= require('underscore'),
	rurl		= require('url'),
	querystring	= require('querystring'),
	jwt 		= require('jwt-simple'),
	uuid 		= require('uuid'),
	debug		= require('debug')('helpdesk'),
	Ticket		= require('../models/ticket.js'),
	User		= require('../models/user.js');
	
	//Recaptcha	= require('recaptcha-async');
	
	var topics 			= [];		// cache
	var topic_field_id 	= 0
	
	//
	// Get Available Ticket Topics
	//
	function get_ticket_topics(cb) {
		app.zendesk.ticketfields.list(function (err, req, result) {
			if (err) {
		    	cb(err, null);
				return;
			} else {
				for(var r in result) {
					var topic = result[r]
					if( topic.title === 'topic' ) {
						topic_field_id = topic.id
						console.log("topic_field_id", topic_field_id)
						var custom_field_options = topic.custom_field_options
						eyes.inspect(custom_field_options, "custom_field_options")
						for( var c in custom_field_options ) {
							var field = custom_field_options[c]
							var topic = {
								id: 	field.value,
								name: 	field.name
							}
							topics.push(topic)
						}
					}
				}
				cb(null, topics)
			}
		})
	}
	
	//
	// Get Available Forum Topics
	//
	function get_forum_topics(cb) {
		app.zendesk.forums.list( function (err, req, result) {
			if (err) {
		    	console.log("err etting forums")
			} else {
				var topics = []
				async.each(result, function(forum, cb) {
					//eyes.inspect(forum, "forum")
					var forum_id = forum.id
					console.log("forum", forum_id, forum.name, forum.forum_type, forum.access)
					app.zendesk.topics.listByForum( forum_id, function (err, req, result) {
						if( err ) {
							console.log("err getting topic for forum", forum_id)
							cb(err)
						} else {
							eyes.inspect(result, "topics for "+forum_id)
							cb(null)
						}
					})
				}, function(err) {
					cb(null, topics)					
				})
			}
		})
	}
	
module.exports = {
	
	//
	// All Cases for current customer
	//
	show_tickets : function(req, res) {
		var user 	= req.session.user;
		console.log("Show tickets for", user.displayname, user.desk_id)
		app.zendesk.tickets.listByUserRequested(user.desk_id, function (err, req, result) {
			if (err) {
				logger.info("Error getting tickets:"+err)
		    	result = []
			} 
			//eyes.inspect(result)
			var max 		= result.length
			
  		  	res.render( 'helpdesk/cases',
  			{	layout: 	'layout.ejs',
  				menu: 		'#help_desk_menu',
  				user: 		user,
				max: 		max,
				tickets:  	result.sort( function(a,b ) { return b.id - a.id})
  			});
			
		})
	},
	
	// ==============================
	// Show a particular ticket by id
	//
	show_ticket: function(req, res) {
		var user 	= req.session.user;
		var id 		= req.params['id']
		console.log("Show ticket:", id)

		async.parallel([
			function(cb) {
				app.zendesk.requests.getRequest(id, function (err, req, result) {
					if (err) {
				    	res.send("Error fetching ticket");
					} else {
						cb(null, result)
					}
				})
			},
			function(cb) {
				app.zendesk.requests.listComments(id, function (err, req, result) {
					if (err) {
						console.log("Error getting comments")
						cb(err, null)
					} else {
						cb(null, result[0])
					}
				})
			}
		], function(err, results) {
			var ticket = results[0]
			eyes.inspect(results[1], "results[1]")
			ticket['comments'] 	= results[1].comments
			ticket['users']		= results[1].users
			eyes.inspect(ticket, "ticket")
			
			res.render( 'helpdesk/show',
  			{	layout: 'layout.ejs',
  				menu:  	'#help_desk_menu',
  				user: 	 user,
				ticket:  ticket
  			});
		})
	},
	
	new_ticket: function(req, res) {
		var user 	= req.session.user;
		// get the hospital
		User.findHospital(user.hospital_id, function(err, hospital) {
			//eyes.inspect(hospital, "hospital")
			if( !err ) {
				user.hospital_name	= hospital.name
				user.hospital_bpid	= hospital.bpid
			}
			for( var k in user ) {
				if( user[k] == null ) user[k]=''
			}
			eyes.inspect(user, "user")
			//get_ticket_topics( function(err, labels) {
			Ticket.get_topics( function(err, labels) {
	  		  res.render( 'helpdesk/new_ticket',
	  			{	layout: 'layout.ejs',
	  				menu: '#help_desk_menu',
	  				user: user,
					labels: labels
	  			});
			})			
		})

	},
	
	new_question: function(req, res) {
		var user 	= req.session.user;
		get_forum_topics( function(err, topics) {
  		  res.render( 'helpdesk/new_question',
  			{	layout: 'layout.ejs',
  				menu: '#help_desk_menu',
  				user: user,
				topics: topics
  			});
		})
	},

	screensteps: function(req, res) {
		var user 	= req.session.user;
		var url 	= "http://bcarehelpdesk.screenstepslive.com/s/how_to/m/16091"
		
		return res.render( 'helpdesk/help_desk',
		{	layout: 'layout.ejs',
			menu: '#training_menu',
			user: user,
			url: url
		});
	},
	
	chat: function(req, res) {
		var user 	= req.session.user;
		return res.render( 'helpdesk/chat',
		{	layout: 'layout.ejs',
			menu:   '#help_desk_menu',
			user: user,
		});
	},
	
	faq: function(req, res) {
		console.log("Helpdesk FAQ")
		var user 	= req.session.user;
		var portal	= app.config.zendesk.portal+ "/hc/en-us"
		//eyes.inspect(req.cookies, "req cookies")
		
		if( !user ) {
			return res.render( 'helpdesk/faq',
			{	layout: 'layout.ejs',
				menu: '#faq_menu',
				user: user,
				url: portal
			});
		}
		
		var payload = {
		    iat: (new Date().getTime() / 1000),
		    jti: uuid.v4(),
		    name: user.displayname,
		    email: user.email
		};
		console.log("payload", payload)
	
	    var token 	= jwt.encode(payload, app.config.zendesk.sso_token);
		var url 	= 'https://'+ app.config.zendesk.subdomain + '.zendesk.com/access/jwt?jwt='+token
		
		res.render( 'helpdesk/faq',
			{	layout: 'layout.ejs',
				menu: '#faq_menu',
				user: user,
				url: url
		});
	},
	
	help_desk: function(req, res) {
		var user 		= req.session.user;
		var messages	= req.flash('info').join(',')
		
		console.log(req.query)
		
		var name 				= req.query['name']  || ""
		var email 				= req.query['email'] || ""
		var phone   			= req.query['phone'] || ''
		var facility_name 		= req.query.facility_name || ""
		var facility_address 	= req.query.facility_address || ""
		var facility_bpid		= req.query.facility_bpid || ""
		var topic 				= req.query.topic || ""
		var problem 			= req.query.problem || ""
		
		console.log("found flash info", messages)
		
		res.render( 'helpdesk/help_desk',
			{	layout:   			'layout.ejs',
				menu: 	  			'#help_desk_menu',
				user: 	  			user,
				messages: 			messages,
				name:  				name,
				email:  			email,
				phone: 				phone,
				facility_name: 		facility_name,
				facility_address: 	facility_address,
				facility_bpid: 		facility_bpid,
				topic: 				topic,
				problem: 			problem
			});
	},
	
	// Anonymous user Ticket... send email
	submit_anon_ticket: function(req, res) {
		var user 	= req.session.user;
		eyes.inspect(req.body)
		
		var recaptcha = new Recaptcha.reCaptcha();

		recaptcha.on('data', function (captcha_res) {
			eyes.inspect(captcha_res, "captcha res")
			if(captcha_res.is_valid) {
				
				delete req.body.recaptcha_challenge_field
				delete req.body.recaptcha_response_field
				
				var text = "B-CARE Helpdesk Request:\n"
				for( var k in req.body ) {
					text += k + ":\t" + req.body[k] + "\n"
				}		
				try {
					console.log("Send email to support",app.config.support_email)
					app.sendgrid.send({
						to: app.config.support_email,
						from: 'pat@cappelaere.com',
						subject: 'B-CARE Helpdesk User Request',
						text: text
					}, function(success, message) {
						logger.info("sendgrid", success, message, text)
				
						if (success != null) {
					  		logger.error("Failed sending feedback message", succes, message);
						}
					});
				} catch(e) { console.log("sendgrid exception:", e);}
				
				res.render( 'helpdesk/request_submitted',
					{	layout:   'layout.ejs',
						menu: 	  '#help_desk_menu',
						user: 	  user
					});
			} else {
				console.log("captcha error", captcha_res.error)
				//html = recaptcha.getCaptchaHtml(app.RECAPTCHA_PUBLIC_KEY, res.error);
				req.flash("info", "Invalid Captcha")
				var query = "?"
				query += "name="+req.body.name
				query += "&email="+req.body.email
				query += "&phone="+req.body.phone
				query += "&facility_name="+req.body.facility_name
				query += "&facility_address="+req.body.facility_address
				query += "&facility_bpid="+req.body.facility_bpid
				query += "&topic="+req.body.topic
				query += "&problem="+req.body.problem
				
				console.log(query)
				res.redirect("/help_desk"+query)
			}
		});

		recaptcha.checkAnswer(app.RECAPTCHA_PRIVATE_KEY, 
			req.connection.remoteAddress, 
			req.body.recaptcha_challenge_field, 
			req.body.recaptcha_response_field);
							  
	},
	// 
	// Submit Zendesk Ticket
	//
	submit_ticket: function(req, res) {
		var user 	= req.session.user;
		//eyes.inspect(req.body)
		
		Ticket.create(user, req.body.topic, req.body.title, req.body.ticket_text, req.body.priority, function(err, id) {
			if( err ) {
				res.send("Error creating ticket"+err )
			} else {
					res.render("helpdesk/submitted", {
						layout: 'layout.ejs',
						menu: "#ticket_menu",
						user: user,
						case_id: id
					})
			}
		})
		
		// create ticket on behalf of customer
		//var json 	= {
		//	"ticket": {
		//		"requester": {
		//			"name": user.displayname,
		//			"email": user.email
		//		},
		//		"custom_fields" : [ 
		//			{   id: 	topic_field_id,
		//				value:  req.body.topic
		//			}
		//		],
		//		"subject" : 	req.body.title, 
		//		"comment": {
		//			"body":  req.body.ticket_text
		//		}
		//}}
		//logger.info("submitting ticket: ", json)
		
		//app.zendesk.tickets.create(json, function (err, req, result) {
		//	if (err) {
		//		logger.error(err)
		//		res.send("Error creating ticket"+err )
		//	} else {
		//		eyes.inspect(result, "created ticket")
		//		var case_id = result.id
		//		console.log("case:", case_id)
		//		res.render("helpdesk/submitted", {
		//			layout: 'layout.ejs',
		//			menu: "#ticket_menu",
		//			user: user,
		//			case_id: case_id
		//		})
		//	}
		//})
	},
	
	submit_question: function(req, res) {
		var user 	= req.session.user;
		var topic	= req.body.topic
		eyes.inspect(req.body)
		
		var question 	= {
			"request": {
				"type": "question",
				"requester_id": 	user.desk_id,
				"submitter_id": 	user.desk_id, 
				"custom_fields" : [ 
					{   id: 	topic_field_id,
						value:  req.body.topic
					}
				],
				"subject" : 	req.body.title, 
				"comment": {
					"body":  req.body.ticket_text
				}
		}}
	
		eyes.inspect(question, "json submitted question zendesk.com")
		//return res.send(question)
		app.zendesk.requests.create(question, function (err, req, result) {
			if (err) {
				logger.error(err)
				res.send("Error creating ticket"+err )
			} else {
				eyes.inspect(result, "created ticket")
				var case_id = result.id
				console.log("case:", case_id)
				res.render("helpdesk/question_submitted", {
					layout: 'layout.ejs',
					user: user,
					case_id: case_id
				})
			}
		})
	}
}
