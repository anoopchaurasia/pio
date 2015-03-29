fm.Package("app");
fm.Import("app.pio.Result");
fm.Import("app.pio.PioApply");
fm.Include("web");
fm.Class("Pio", "Base");
app.Pio = function (me, Result, PioApply){this.setMe=function(_me){me=_me;};
	'use strict';
	this.init = function () {
		Static.config = JSON.parse(require("fs").readFileSync(__dirname +'/../../config.json').toString('utf-8'));
	};

	Static.main = function(){
		web = webPath;
		process.on('uncaughtException', function(e){
			console.error(e);
		});
		Starter.handle(require('http').createServer().listen(8888, "localhost"));
	};

	this.Pio = function () {
		var predictionio = require('predictionio-driver');
		me.predictionEngine = new predictionio.Engine({url: "http://"+ me.config.predictionio.host+ ":" +me.config.predictionio.engineport});
		me.predictionClient = new predictionio.Events(
			{
				url: "http://"+me.config.predictionio.host+ ":" +me.config.predictionio.eventport,
				appId: me.config.predictionio.appid,
				accessKey: me.config.predictionio.accessKey
			})
		var elasticsearch = require('elasticsearch');
		me.elasticClient = new elasticsearch.Client({
			host: "http://"+ me.config.elasticsearch.host + ":" +me.config.elasticsearch.port,
			log: 'trace'
		});
		me.result = new Result(me);
		me.pioApply = new PioApply(me);
	};
	this.method = function( req, res ) {
		res.writeHead(400, {'Content-Type': 'text/html'});
		res.write("This Page not accessible");
		res.end();
	};

	this.addevent = function (req, res) {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write("Thank you " + req.params.id);
		res.end();
		me.pioApply.addEvent(req.params);
	};

	this.rateevent = function (req, res){
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write("Thank you " + req.params.user.id + " " + req.params.event.id);
		res.end();
		me.pioApply.rateEvent(req.params.event, req.params.user, req.params.rating);
	};


	this.adduser = function (req, res) {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write("Thank you " + req.params.id);
		res.end();
		me.pioApply.addUser(req.params);
	};

	this.getprediction = function (req, res) {
		me.result.getForEventIds (
			req.params.event_ids.split(","),
			req.params.user_keys, function (err, resp) {
				res.writeHead(200, {'Content-Type': 'application/json'});
				res.write(JSON.stringify(resp));
				res.end();
		});
	};

	Static.mergeArray = function () {
		var newArr = [];
		for(var k =0; k < arguments.length; k++){
			Array.prototype.push.apply(newArr, arguments[k]);
		}
		return newArr;
	};

	Static.getNames = function (obj, type) {
		var names = [];
		obj[type].map(function(s) {
			Array.prototype.push.apply(names, s['sub_'+type].map(function(s) {return s.name}));
		});
		console.log(names);
		return names;
	}
};