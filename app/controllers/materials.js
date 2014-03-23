var util		= require('util'),
	async		= require('async'),
	eyes		= require('eyes'),
	path		= require('path'),
	fs			= require('fs'),
	crypto 		= require('crypto'),
	request		= require('request'),
	xml2js		= require('xml2js'),
	moment		= require('moment'),
	debug		= require('debug')('materials');
	
	
var url_base  	= "https://s3.amazonaws.com"
	
function getSlideshows(bucket, cb) {
	var secret 	= app.SLIDESHARE_API_SECRET
	var key		= app.SLIDESHARE_API_KEY
	var ts		= Math.round(+new Date()/1000);
		
	//var hash 	= crypto.createHash('sha1').update(secret + ts).digest('binary').substring(0, 16);
	var hash 	= crypto.createHash('sha1').update(secret + ts).digest('hex');
	var url		= "https://www.slideshare.net/api/2/get_slideshows_by_user?"
	
	url += "username_for=" + app.config.slideshare.username
	url += "&username=" + app.config.slideshare.username
	url += "&password=" + app.config.slideshare.password
	url += "&limit=25"
	url += "&detailed=1"
	url += "&api_key="+ key
	url += "&hash="+hash
	url += "&ts="+ ts
	
	console.log("slideshare url:"+ url)
	
	request.get(url, function(err1, r ,body) {
		//console.log("get slideshows for ", bucket, err1, body)
		//eyes.inspect(err1,"err1")
		//console.log("r", r)
		//eyes.inspect(body, "body")

		if( !err1 ) {
			var parser = new xml2js.Parser();
			parser.parseString(body, function (err2, result) {
		        console.log(err2, result);
				var slideshows = result.User.Slideshow
				for( var s in slideshows) {
					var Tags = slideshows[s].Tags[0].Tag
					//console.log("tags for ", slideshows[s].Title)
					//eyes.inspect(Tags, "Tags")
					
					var found = false;
					for( var t in Tags ) {
						var tag = Tags[t]
						//eyes.inspect(tag, "tag")
						if (tag['_'] === bucket ) {
							debug("found tag:", bucket)
							found = true
						}
					}
					
					if( !found ) {
						//console.log("remove:", slideshows[s].Title)
						delete slideshows[s]
					}
				}
				console.log(slideshows)
				cb(err2, slideshows)
		    });
		} else {
			res.send("Error accessing Slideshare"+err1)
		}
	});
}

function getPdfs( bucket, callback ) {
	debug("Getting Pdfs...", bucket)
	app.s3.listObjects({Bucket: bucket}, function (err, data) {
		debug("**Err:", err)
		var files = {}
		if( err === null ) {
			try{
				//eyes.inspect(data.Contents,"contents")
				for( var d in data.Contents ) {
					// eyes.inspect(data.Contents,"contents")
					var datum 		= data.Contents[d]
					var key 		= datum.Key
					var arr			= key.split(".")
					var url 		= path.join(url_base, bucket, key)
					var base		= arr[0]
					var base_arr	= base.split('_')
					var ext			= arr[1]
				
					if( files[base] === undefined ) {
						files[base] = {}
						files[base][ext] = url
					} else {
						files[base][ext] = url
					}
				}
				//eyes.inspect(files, "files")
			} catch(e) { 
				logger.error("exception e:"+e); 
			}
			callback( 0, files)
		} else {
			callback( 0, {})
		}
	})
}

module.exports = {
	index: function(req, res) {
		var id 		= req.params['id']
		debug("materials id:", id)
		
		var bucket  = app.config.buckets[id]
		var user 	= req.session.user;
		
		getSlideshows(bucket, function(err, json) {
			res.set({
			  'Cache-Control': 'no-cache, no-store, must-revalidate',
			  'Pragma': 'no-cache',
			  'Expires': '0'
			})
			
			res.render( 'materials/index2', 
				{	layout: 'layout.ejs',
					menu: '#training_menu',
					id: id,
					files: json,
					user: user,
					title: app.config.titles[id]
				});
		})
	},
	
	index_old: function(req, res) {
		var id 		= req.params['id']
		debug("materials id:", id)
		var bucket  = app.config.buckets[id]
		var user = req.session.user;
		
		getSlideshows()
		
		debug("accessing S3 bucket:", bucket)
		getPdfs( bucket, function(err, files) {
			debug("render files...", err, files)
			res.set({
			  'Cache-Control': 'no-cache, no-store, must-revalidate',
			  'Pragma': 'no-cache',
			  'Expires': '0'
			})
			
			res.render( 'materials/index', 
				{	layout: 'layout.ejs',
					menu: '#training_menu',
					id: id,
					files: files,
					user: user
				});		
		})
	},
	
	wistia: function(req, res) {
		var user 	= req.session.user;
		var passwd	= app.WISTIA_API_PASSWORD
		
		getSlideshows('webinars', function(err, ppts) {
			eyes.inspect(ppts,"webinar ppts");
			
			var url  	= "https://api.wistia.com/v1/projects/" + app.config.wistia.project +".json?api_password="+passwd
			//console.log(url)
			request.get(url, function(err, r ,body) {
				//console.log("Wistia error", err)
				//console.log("Wistia body", body)
				if( err ) {
					logger.error("Wistia error", err)
					res.send(err)
				} else {
					var json = JSON.parse(body)
					for( var m in json.medias) {
						var media = json.medias[m]
						json.medias[m].human_duration = moment.duration(media.duration,'seconds').humanize()
					}
					res.set({
					  'Cache-Control': 'no-cache, no-store, must-revalidate',
					  'Pragma': 'no-cache',
					  'Expires': '0'
					});
					
					//console.log("wistia body", json.medias)
					res.render( 'materials/wistia', 
						{	layout: 'layout.ejs',
							menu: '#training_menu',
							ppts: ppts,
							files: json.medias,
							user: user
						});		
				}
			})
		})
	},
	videos: function( req, res ) {
		var user 	= req.session.user;
		var bucket  = app.config.buckets['webinars']
		debug("material videos bucket: ", bucket)
		getPdfs( bucket, function(err, files) {
			res.set({
			  'Cache-Control': 'no-cache, no-store, must-revalidate',
			  'Pragma': 'no-cache',
			  'Expires': '0'
			});
			
			res.render( 'materials/videos', 
				{	layout: 'layout.ejs',
					menu: '#training_menu',
					files: files,
					user: user
				});	
		});
	}
};