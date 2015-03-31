fm.Package("app.pio");
fm.Import("app.pio.Event");
fm.Import("app.pio.User");
fm.Import("app.pio.Rate");
fm.Class("PioApply", function (me, Event, User, Rate) {
	'use strict';
	this.setMe=function(_me){me=_me;};

	this.PioApply = function (pio) {
		me.pio = pio;
	};

	this.addUser = function (userData) {
		var user = new User(userData);
		createUser(user.toUser());
		createItem(user.toEvent());
		rateItem(user.toRating());

	};

	this.addEvent = function (eventData) {
		var event = new Event(eventData);
		createUser(event.toUser());
		createItem(event.toEvent());
		rateItem(event.toRating());
	};

	this.rateEvent = function (event, user, rating) {
		var rateEvent = new Rate(event, user, rating);
		rateItem(rateEvent.toRating());
	};

	function createUser (user) {
		me.pio.predictionClient.createUser(user)
		.then(function (res, b) {
		    console.log(res, 'added user', user.entityId);
		  }).catch(function  (a, b) {
		  	console.error(a, b, "add useer error", user.entityId);
		  });
	}

	function createItem (item) {
		me.pio.predictionClient.createItem(item).
	    then(function(result, e) {
	    	console.log(result, "add item", item.entityId);
	    }).catch(function(err) {
	        console.error(err, "add event error", item.entityId);
	    });
	}

	function rateItem (rating) {
		me.pio.predictionClient.createAction(rating).
	    then(function(result) {
	            console.log(result, "rated successfully", rating.uid, rating.iid);
	    }).
	    catch(function(err) {
	        console.error(err, "error in rating", rating.uid, rating.iid);
	    });
	}
});