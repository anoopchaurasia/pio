'use strict';
var config = JSON.parse(require("fs").readFileSync('config.json').toString('utf-8'));

var elasticsearch = require("elasticsearch");
var predictionio = require('predictionio-driver');

// accessKey is required for PredictionIO 0.8.2+
var p_client = new predictionio.Events(
	{
		url: "http://"+config.predictionio.host+ ":" +config.predictionio.eventport,
		appId: config.predictionio.appid,
		accessKey: config.predictionio.accessKey
	});

var e_client = new elasticsearch.Client({
				host: config.elasticsearch.host + ":" +config.elasticsearch.port,
				log: 'trace'
			});

e_client.indices.delete({
	index: config.elasticsearch.index
}).then(function(){
	recreateIndices();
});
function recreateIndices () {
	e_client.indices.create(
		{
			index: config.elasticsearch.index,
			timeout: 5000,
			masterTimeout: 5000,
			ignore: [400]
		}
	).then(function (e, result) {
		console.log(e, result);
		start();
	}, function (e) {
		console.error(e)
	});
}

var user_id = 1;

var completed = 0;
function start() {
	completed++;
	if(completed == 2) {
		addInterests();
	}
}

function addInterests () {
	interests.forEach(function (name, index) {
		var userid = user_id++;
		console.log({
			index: config.elasticsearch.index,
			type: 'user',
			id: userid,
			body: {
				tags: name
			}
		});
		e_client.create({
			index: config.elasticsearch.index,
			type: 'user',
			id: userid,
			body: {
				tags: name
			}
		}).then(function(a,b) {
			console.log(a,b)
			addUser([name], userid);
			 addEvent({
			 	id:"i" + userid
		    }, 5, userid, [name]);
		}, function (a, b) {
			//console.error(a,b);
		});
	});
}
var req = require('http').request({
	method: "GET",
	host: "coderafting.com",
	port: 4321,
	path: "/settings.json?with_sectors=true&with_functions=true"
}, function (res){
	var data = "";
	res.on('data', function (chunk) {
		data += chunk;
  	});
  	res.on('end', function (chunk) {
  		data = JSON.parse(data);
  		data.settings.sectors.forEach(function (s, index) {
  			Array.prototype.push.apply(interests, s.sub_sectors.map(function (sub) {
  				return sub.name;
  			}));

  		});
  		data.settings.functions.forEach(function (s, index) {
  			Array.prototype.push.apply(interests, s.sub_functions.map(function (sub) {
  				return sub.name;
  			}));
  		});
  		interests = keepUnique(interests);
  		start();
  	});
});

req.end()


function addUser (interests, id) {
	console.log('user', id);
	p_client.createUser({
	    entityId: id
	    , properties: {
		   interests: interests
	    }
	    , eventTime: new Date().toISOString()
	  }).then(function (res, b) {
	    console.log(res, 'added user');
	  }).catch(function  (a, b) {
	  	console.error(a, b, "add useer error");
	  });
}

function addEvent(event, rating, user_id, interests) {
	createEvent(event, interests);
	rateEvent(event.id, user_id, rating);
}

function createEvent (event, interests) {
	p_client.createItem({
	    entityId: event.id
	  , properties: {
		  type: interests
	  },
	  eventTime: new Date().toISOString()
	}).
    then(function(result) {
        console.log(result, "event added"); // Prints "{eventId: 'something'}"
    }).
    catch(function(err) {
        console.error(err, "add event error"); // Something went wrong
    });
}

function rateEvent (eventid, userid, rating) {
	p_client.createAction({
	  uid: userid
	  , iid: eventid
	  , event: 'rate'
	  , properties: {
	  	'rating': rating * 1.0000001
	  }
	}).
    then(function(result) {
            console.log(result, "rated successfully"); // Prints "{eventId: 'something'}"
    }).
    catch(function(err) {
        console.error(err, "error in rating"); // Something went wrong
    });
}

function keepUnique (arr) {
	var temp = {};
	return arr.filter(function (item) {
		if(temp[item.toLowerCase()]){
			return false;
		}
		temp[item.toLowerCase()] = true;
		return true;
	});
}

var interests = [
"Management",
"Business",
"Sales",
"Marketing",
"Communication",
"Microsoft Office",
"Customer Service",
"Training",
"Microsoft Excel",
"Project Management",
"Designs",
"Analysis",
"Research",
"Websites",
"Budgets",
"Organization",
"Leadership",
"Time Management",
"Project Planning",
"Computer Program",
"Strategic Planning",
"Business Services",
"Applications",
"Reports",
"Microsoft Word",
"Program Management",
"Powerpoint",
"Negotation",
"Software",
"Networking",
"Offices",
"English",
"Data",
"Education",
"Events",
"International",
"Testing",
"Writing",
"Vendors",
"Advertising",
"Databases",
"Technology",
"Finance",
"Retail",
"accounting",
"social media",
"Teaching",
"Engineering",
"Performance Tuning",
"Problem Solving",
"Marketing Strategy",
"Materials",
"Recruiting",
"Order Fulfillment",
"Corporate Law",
"Photoshop",
"New business development",
"Human resources",
"Public speaking",
"Manufacturing",
"Internal Audit",
"strategy",
"Employees",
"Cost",
"Business Development",
"Windows",
"Public Relations",
"Product Development",
"Auditing",
"Business Strategy",
"Presentations",
"Construction",
"Real Estate",
"Editing",
"Sales Management",
"Team Building",
"Healthcare",
"Revenue",
"Compliance",
"Legal",
"Innovation",
"Policy",
"Mentoring",
"Commercial Real Estate",
"Consulting",
"Information Technology",
"Process Improvement",
"Change management",
"Heavy Equipment",
"Teamwork",
"Promotions",
"Facilities Management"]


