'use strict';

var predictionio = require('predictionio-driver');

var engine = new predictionio.Engine({url: config.predictionio.host+ ":" +config.predictionio.engineport});
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
});

createUserEvent({
	id: 987,
	interests: ["Hiring", "Sales","Business Partners", "Cofounder", "CTO", "Coding", "Relaxing"
],
keys: [ "Portals", "Business Development", "Market Research", "Program Management"]
}, {
	id: 9876543,
});

function createUserEvent (user, event) {
	addUser(user, function(){
		createEvent(event, user, function () {
			rateEvent(user, event);
		});
	});
}

function addUser (user, cb) {
	client.createUser({
	    entityId: user.id
	    , properties: {
		   interests: user.interests,
		   userinterestkeywords: user.keys
	    }
	    , eventTime: new Date().toISOString()
	  }).then(function (res, b) {
	    console.log(res, 'added user');
	   cb();
	  }).catch(function  (a, b) {
	  	console.error(a, b, "add useer error");
	  });
}

function rateEvent (user, event) {
	client.createAction({
	  uid: user.id
	  , iid: event.id
	  , event: 'view'
	  , properties: {
	  	'rating': 3 * 1.0000001
	  }
	}).
    then(function(result) {
            console.log(result, "rated successfully"); // Prints "{eventId: 'something'}"
    }).
    catch(function(err) {
        console.error(err, "error in rating"); // Something went wrong
    });
}

function createEvent (event, user, CB) {
	client.createItem({
	    entityId: event.id
	  , properties: {
		  sectors: []
		  , functions: []
	  	  , 'tags': user.interests
	  },
	  eventTime: new Date().toISOString()
	}).
    then(function(result) {
        console.log(result, "event added"); // Prints "{eventId: 'something'}"
        CB();
    }).
    catch(function(err) {
        console.error(err, "add event error"); // Something went wrong
    });
}
