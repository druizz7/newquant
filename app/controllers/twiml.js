var util		= require('util'),
	async		= require('async'),
	eyes		= require('eyes'),
	Ticket		= require('../models/ticket.js'),
	twilio		= require('twilio');
	
	
module.exports = {

	// ================================================================================
	// We need to define a set of web hooks to manage voice/sms to twilio phone numbers
	// This is also called a twilio app and has an appid that contains all that info
	// 
	
	voice_url: function(req, res) {
		logger.info("voice_url", JSON.stringify(req.body))
		
		// RESPONSE WITH TWIML
		var resp = new twilio.TwimlResponse();
		resp.say( {voice:'woman'}, 'Welcome to B-CARE Help Desk!')
		resp.say( {voice:'woman'}, 'HELP DESK IS NOT OPERATIONAL BUT LET ME TRY TO CONNECT YOU TO AN AGENT')
		resp.say( {voice:'woman'}, 'PLEASE HOLD')
		resp.dial({timeout:'15'}, app.config.helpdesk_number)
		
		
		res.writeHead(200, {
			'Content-Type': 'text/xml'
		});
		res.end(resp.toString())
	},
	
	voice_fallback_url: function(req, res) {
		logger.info("voice_fallback_url", JSON.stringify(req.body))
		
		var resp = new twilio.TwimlResponse();
		var message = "A voice fallback error occurred. Sorry\n"
		resp.say(message)	
		
		res.writeHead(200, {
			'Content-Type': 'text/xml'
		});
		res.end(resp.toString())
	},

	voice_status_callback_url: function(req, res) {
		logger.info("voice_status_callback_url", JSON.stringify(req.body))
		var resp = new twilio.TwimlResponse();
		var message = "A Voice Status error occurred. Sorry\n"
		resp.message(message)	
		
		res.writeHead(200, {
			'Content-Type': 'text/xml'
		});
		res.end(resp.toString())
	},
	
	// ========================================================
	// SMS WEB HOOK
	// https://www.twilio.com/docs/api/twiml/sms/twilio_request
	//
	sms_url: function(req, res) {
		var body 		= req.body
		var MessageSID 	= body.MessageSID
		var SmsSid		= body.SmsSid
		var AccountSid	= body.AccountSid
		var FromNumber	= body.From
		var ToNumber	= body.ToNumber
		var Message		= body.Body
		
		logger.info("Received SMS")
		logger.info("sms_url body", JSON.stringify(req.body))

		var resp = new twilio.TwimlResponse();
		
		// check if we know that phone number
		var query = app.client.query("SELECT * FROM users where phone= $1", [req.body.From], function(err, result) {
		
			if( !err && result.rows[0] != undefined ) {
				var user 	= result.rows[0]
				if( user.desk_id != null || user.desk_id != '') {
					var message = "Thank you "+ user.displayname+"\n"
					message += "I will create a ticket and get back to you ASAP.\n"
					message += "The B-CARE Help Desk Team.\n"
					resp.message(message)
					
					Ticket.create(user, null, "SMS Ticket", Message, function(err, id) {
						
					})
					//var json = {
					//	"type":  		"phone",
					//	"subject":  	"Phone Case Subject",
					//	"priority": 	4,
					//	"status": 		"open",
					//	"labels": 		["Spam", "Ignore"],
					//	"message": {
					//		"direction": "in", 
					//		"body": 	Message,
					//		"to": 		"support@bcarehelp.desk.com",
					//		"from": 	user.email,
					//		"subject":  "SMS Request"
					//	},
					//	"_links": {
					//		"customer":{
					//			"class":"customer",
					//			"href":"/api/v2/customers/"+user.desk_id
					//}}}
					//eyes.inspect(json, "json desk.com")
					// Old DESK.com new ticket creation
					//app.oauth.post(
					//	'https://bcarehelp.desk.com/api/v2/cases',
					//	app.BCARE_OAUTH_TOKEN, 
					//	app.BCARE_OAUTH_TOKEN_SECRET,   
					//	JSON.stringify(json),
					//	function (e, data, res){
					//		var json = JSON.parse(data)
					//		console.log("BCARE case create result:")
					//		if (e) {
					//			console.error(e);
					//		} else {
					//			console.log(require('util').inspect(json));
					//		}
					//	});   	
					
				} else {
					var message = "Thank you "+ user.displayname+"\n"
					message += "I cannot create a ticket because I do not recognize your record.  Please contact us.\n"
					message += "The B-CARE Help Desk Team.\n"
					resp.message(message)	
				}
			} else {
				resp.message('Thank you but we do not recognize your phone number.  Please update your profile!')
			}

			res.writeHead(200, {
				'Content-Type': 'text/xml'
			});
			res.end(resp.toString())
		})
	},
	
	sms_fallback_url: function(req, res) {
		logger.info("sms_fallback_url error", JSON.stringify(req.body))
	
		var resp = new twilio.TwimlResponse();
		var message = "A sms_fallback_url error occurred. Thank you\n"
		resp.message(message)	
		
		res.writeHead(200, {
			'Content-Type': 'text/xml'
		});
		res.end(resp.toString())
	},
	
	sms_status_callback_url: function(req, res) {
		logger.info("sms_status_callback_url", JSON.stringify(req.body))
		var resp = new twilio.TwimlResponse();
		var message = "A sms_status_callback_url error occurred. Thank you\n"
		resp.message(message)	
		res.writeHead(200, {
			'Content-Type': 'text/xml'
		});
		res.end(resp.toString())
	}
}