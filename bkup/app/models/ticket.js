var eyes		= require('eyes');
var debug		= require('debug')('ticket');

var topics 			= [];		// cache
var topic_field_id 	= 0

function find_topic( tname ) {
	debug("Trying to find:", tname )
	for( var t in topics) {
		var topic = topics[t]
		//console.log("find topic:",tname, topic.name)
		if( topic.id == tname ) {
			return topic.id
		}
	}
	console.log("could not find topic:", tname)
	eyes.inspect(topics, "topics")
	return null
}
module.exports = {
	//
	// Get Available Ticket Topics
	//
	get_topics: function(cb) {
		debug("Ticket get topics...")
		app.zendesk.ticketfields.list(function (err, req, result) {
			debug("zendesk ticket fields err", err)
			if (err) {
				console.log("Err getting topics:", err)
		    	cb(err, null);
			} else {
				topics = []
				//eyes.inspect(result, "topics results")
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
	},
	
	// Creates a new Ticket
	// Returns in callback(err, case_id)
	//
	create: function(user, topic, title, body, priority, cb) {
		var json 	= {
			"ticket": {
				"requester": {
					"name": 	user.displayname,
					"email": 	user.email
				},
				"subject" : 	title, 
				"comment": {
					"body":  	body
				},
				"priority": 	priority
		}}
		
		if( topic ) {
			var topic_name = find_topic(topic)
			json.ticket.custom_fields = [
				{
					id: topic_field_id,
					value: topic_name
				}
			]
		}
		debug("submitting ticket...")
		//eyes.inspect(json, "ticket")
		app.zendesk.tickets.create(json, function (err, req, result) {
			if (err) {
				logger.error(err)
				cb(err, null)
			} else {
				cb(err, result.id)
			}
		})
		//cb(0, null)
	}
}