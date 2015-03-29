fm.Package("app.pio");
fm.Class("Result", function (me) {
	'use strict';
	this.setMe=function(_me){me=_me;};

	this.Result = function (pio){
		me.pio = pio;
	};

	this.getForEventIds = function (event_ids, user_keys, cb, ecb) {

		me.pio.elasticClient.search({
			index: me.pio.config.elasticsearch.index,
			q: "*" +user_keys.split(",")[0] + "*",
			type: "user"
		}).then(function(result){
			console.log(me.pio.config.elasticsearch.index, user_keys, event_ids, result);
			if(result.hits.hits.length == 0){
				ecb();
				return;
			}
			getPrediction(result.hits.hits[0]._id, event_ids, cb);
		});
	};
	function getPrediction (id, event_ids, cb) {
		console.log(id, event_ids);
		me.pio.predictionEngine.sendQuery({
			user: "u" + id,
			num: 10,
			whiteList: event_ids
		}, cb);
	}
});


