var util		= require('util'),
	async		= require('async'),
	eyes		= require('eyes'),
    twilio 		= require('twilio');
	
	
module.exports = {
	index: function(req, res) {
		var user = req.session.user
		if( user ) {
			res.render('twilio/index', {layout: true, user: user })
		} else {
			res.redirect("/")
		}
	},
	
	call_browser: function(req, res) {
		var user 		= req.session.user
	    var capability 	= new twilio.Capability(app.TWILIO_ACCOUNT_SID, app.TWILIO_AUTH_TOKEN);
	
		if( user ) {
			res.render('twilio/call_browser', {
				layout: true, 
				user: user,
				token:capability.generate()
			})
		} else {
			res.redirect("/")
		}
	},
	
	call_record: function(req, res) {
		var user = req.session.user
		if( user ) {
			res.render('twilio/call_record', {layout: true, user: user })
		} else {
			res.redirect("/")
		}
	},
	
	call_helpdesk: function(req, res) {
		var user = req.session.user
		var url = app.get('hostBaseUrl')+'/twiml/voice_url'

		logger.info("twilio call_helpdesk", user.phone, app.config.twilio_number, url)
		
		//eyes.inspect(user, "user")
		
		app.twilio.makeCall({
		    to: 	user.phone, 
		    from: 	app.config.twilio_number,
		    url: 	url
		}, function(err, call) {
		    //executed when the call has been initiated.
			if( err ) {
				logger.error("twilio err:", err)
			}
			call.on('connected', function(status) {
				console.log("call connected", status)
			})
			call.on('ended', function(status, duration) {
			        /* This is called when the call ends and the StatusCallback is called.
			            Note: status is probably 'completed' at this point. */
				console.log("call ended", status, duration)
			});
		});
		
		if( user.phone && user.phone != null ) {
			res.render("twilio/call_helpdesk", {
				layout: true,
				user: 	user
			})
		} else {
			res.redirect( "users/"+user.id)
		}
	}
};
