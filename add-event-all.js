'use strict';
var config = JSON.parse(require("fs").readFileSync('config.json').toString('utf-8'));

var predictionio = require('predictionio-driver');

// accessKey is required for PredictionIO 0.8.2+
var client = new predictionio.Events(
	{
		url: "http://"+config.predictionio.host+ ":" +config.predictionio.eventport,
		appId: config.predictionio.appid,
		accessKey: config.predictionio.accessKey
	});

// Returns the server status
client.status().
    then(function(status) {
        console.log(status); // Prints "{status: 'alive'}"
    }, function(e){console.log(e)});


function addEvent(event_id) {
	require("request").get("http://coderafting.com:4321/events/"+event_id+".json", function (err, response) {
		try{
			var event = JSON.parse(response.body);
			console.error(event.id, event_id, "");
			if(!event.id){
				return;
			}
			createEvent(event);
		} catch(e) {
		}
	});
}

for(var i=1; i < 270; i++){
	addEvent(i)
}

var user_id = 1;

function createEvent (event) {
	console.log("event", event.id);
	client.createItem({
	    entityId: event.id
	  , properties: {
		  type: mergeArray(getNames(event, 'sectors'), getNames(event, 'functions'), event.tags.map(function(tag){return tag.name}))
	  },
	  eventTime: new Date(event.created_at).toISOString()
	}).
    then(function(result, e) {
    	var u_id = "u" + (user_id++);
    	createUser(u_id, event);
    	rateEvent(event.id, u_id, 5);
        console.log(result, e, "event added"); // Prints "{eventId: 'something'}"
    }, function(err){
    	console.error(err, "add event error"); // Something went wrong
    }).
    catch(function(err) {
        console.error(err, "add event error"); // Something went wrong
    });
}

function createUser (id, event) {
	client.createUser({
	    entityId: id
	    , properties: {
		   interests: mergeArray(getNames(event, 'sectors'), getNames(event, 'functions'), event.tags.map(function(tag){return tag.name}))
	    }
	    , eventTime: new Date().toISOString()
	  }).then(function (res, b) {
	    console.log(res, 'added user');
	  }).catch(function  (a, b) {
	  	console.error(a, b, "add useer error");
	  });
}

function mergeArray () {
	var newArr = [];
	for(var k =0; k < arguments.length; k++){
		arguments[k].forEach(function(name){
			newArr.push(name)
		});
	}
	return newArr;
}

function rateEvent (eventid, userid, rating) {
	client.createAction({
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

function getNames (event, type) {
	var names = [];
	event[type].map(function(s){
		Array.prototype.push.apply(names, s['sub_'+type].map(function(s) {return s.name}));
	});
	console.log(names);
	return names;
}
