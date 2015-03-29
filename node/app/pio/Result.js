fm.Package("app.pio");
fm.Class("Result", function (me) {
	'use strict';
	this.setMe=function(_me){me=_me;};

	this.Result = function (pio){
		me.pio = pio;
	};

	this.getForEventIds = function (event_ids, user_keys, user_interests, cb) {
		var user_interests = user_interests.split(",");
		var resultList = [];
		var count = 0;
		user_interests.forEach(function (key) {
			count++;
			getRoi(key, event_ids, function(err, resp){
				if(err) {
					resultList.push({"itemScores": []});
				}
				else {
					resultList.push(resp);
				}
				count--;
				if(count == 0) {
					sendResult(resultList, cb);
				}
			});
		});
	};

	function sendResult(resultList, cb) {
		var combinedResult = {};
		resultList.forEach(function (r) {
			r.itemScores.forEach(function (e) {
				combinedResult[e.item] = Math.max(e.score, combinedResult[e.item] || 0);
			});
		});
		var data = {itemScores: []};
		for(var k in combinedResult) {
			data.itemScores.push({
				item: k,
				score: combinedResult[k]
			});
		}
		cb(null, data);
	}

	function getRoi (key, event_ids, cb) {
		me.pio.elasticClient.search({
			index: me.pio.config.elasticsearch.index,
			q: "*" +key+ "*",
			type: "user"
		}).then(function(result){
			var hits = result.hits.hits;
			if(hits.length == 0 || hits[0]._score < .70){
				cb({"itemScores": []});
				return;
			}
			getPrediction(result.hits.hits[0]._id, event_ids, cb);
		});
	}

	function getPrediction (id, event_ids, cb) {
		console.log(id, event_ids);
		me.pio.predictionEngine.sendQuery({
			user: "u" + id,
			num: 10,
			whiteList: event_ids
		}, cb);
	}
});


