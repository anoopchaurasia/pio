'use strict';
var config = JSON.parse(require("fs").readFileSync('config.json').toString('utf-8'));
process.on('uncaughtException', function(e){
	console.error(e);
});
function addEvent(event_id) {
	require("request")
	.get("http://"+config.eventzio.host+":"+config.eventzio.port+"/events/"+event_id+".json", function (err, response) {
		if(response.statusCode == 404 && event_id > 450) {
			console.log(response.body);
			process.exit(0);
			addEvent(++event_id);
			return;
		}
		try{
			var event = JSON.parse(response.body);
			delete event.description;
			console.log("adding event", event.id);
			sendToPrediction(JSON.stringify(event));
			if(!event.id){
				return;
			}
		} catch(e) {
			console.error(e);
		}
		addEvent(++event_id);
	});
}

function sendToPrediction (post_data) {
	 var post_options = {
		host: config.server.host,
		port: config.server.port,
		path: '/pio?method=addevent',
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		  'Content-Length': post_data.length
      	}
  	};
  	var post_req = require("http").request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
  });
  post_req.write(post_data);
  post_req.end();
};

addEvent(1);


