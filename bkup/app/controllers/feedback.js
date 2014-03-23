var util		= require('util'),
	async		= require('async'),
	eyes		= require('eyes')
	
module.exports = {
	index: function(req, res) {
		var user = req.session.user;
	
		eyes.inspect(req.body, "feedback body");
		
		var text = ""
		text += "B-CARE Portal Feedback: "+req.body.message + "\n\n"
		text += "From:     "+req.body.name
		
		if( user ) {
			text += user.displayName+"\n"
			text += "Email:    "+user.email+"\n"
		}
		
		try {
			app.sendgrid.send({
				to: app.config.contact_mail,
				from: 'pat@cappelaere.com',
				subject: 'B-CARE Helpdesk User Feedback',
				text: text
			}, function(success, message) {
				logger.info("sendgrid", success, message)
				
				if (success!=null) {
			  		logger.error("Failed sending feedback message", message);
				} else {
					logger.info("emailed feedback:"+text)
				}
			});
		} catch(e) { console.log("sendgrid exception:", e);}
		
		res.redirect("/")
	}
}
	