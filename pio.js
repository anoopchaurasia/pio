'use strict';

var config = JSON.parse(require("fs").readFileSync('config.json').toString('utf-8'));
var read = require('read')
var predictionio = require('predictionio-driver');
var engine = new predictionio.Engine({url:"http://"+ config.predictionio.host+ ":" +config.predictionio.engineport});
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


var GoogleSpreadsheet = require("google-spreadsheet");
var request = require("request");
var my_sheet = new GoogleSpreadsheet(config.googlesheet);
console.log(GoogleSpreadsheet, my_sheet);

read({ prompt: 'Google UserName: '}, function(er, u) {
  getPassWord(u);
});

function getPassWord (username) {

	read({ prompt: 'Google Password: ', silent: true }, function(er, pw) {
	 	getSheet(username, pw);
	});
}

function getSheet (username, password) {
	my_sheet.setAuth(username, password, function(err){
		if(err){
			console.error("either username or password incorrect");
			process.exit(0);
			return;
		}
		console.log('successfully logged in');
	    my_sheet.getInfo( function( err, sheet_info ){
	        sheet_info.worksheets[0].getRows({num: 89}, {} ,function( err, rows ){
	            extractInfo(rows);
	        });
	    });
	});
}

var i =1;
function extractInfo(rows){
	var userIds = [];
	rows.forEach(function(row){
		if(row.userid < 100){
			row.userid = row.userid;
			row.save();
		}

		userIds[row.userid] = userIds[row.userid] || [];
		Array.prototype.push.apply(userIds[row.userid], row.userprofilekeywords.split(",").map(function(a){return a.trim()}));
		Array.prototype.push.apply(userIds[row.userid], row.userinterestkeywords.split(",").map(function(a){return a.trim()}));
		userIds[row.userid] = keepUnique(userIds[row.userid]);
		userIds[row.userid] = keepUnique(userIds[row.userid]);
	});
	var userAdded = {};
	rows.forEach(function(row){
		if(!row.eventid) {
			return;
		}
		 console.log(row.userrating);
		addEvent(row.eventid, row.userrating, "p"+row.userid, userIds[row.userid]);
		addUser ("p"+row.userid, userIds[row.userid]);
		i++;
	});
}


function addUser (id, interests) {
	console.log('user', id);
	client.createUser({
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

function addEvent(event_id, rating, user_id, interests) {
	require("request").get("http://"+config.eventzio.host+":"+config.eventzio.host+"/events/"+event_id+".json", function (err, response) {
		try{
		var event = JSON.parse(response.body);
		console.error(event.id, event_id, "no id");
		if(!event.id){
			return;
		}
		createEvent(event, interests);
		rateEvent(event.id, user_id, rating);
		}catch(e){
			console.log(e);
		}
	});
}

function createEvent (event, interests) {
	client.createItem({
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

function rateEvent (eventid, userid, rating) {
	console.log('rating', rating);
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
