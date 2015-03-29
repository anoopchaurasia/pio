fm.Package('app.pio');
fm.Class("User", function (me){
	'use strict';
	this.setMe=function(_me){me=_me;};

	this.User = function (user){
		this.id = user.id;
		this.interests = user.interest || [];
		this.profile_keywords = user.profile_keywords || [];
		this.created_at = user.created_at || new Date().toISOString();
		this.pio_interests = user.pio_interests || app.Pio.mergeArray(
			   		me.interests.map(function(interest){return interest.interest;}),
			   		me.profile_keywords.map(function (k) { return k.skill;}));

		this.event_id = "i" + this.id;
		this.rating = 5;
	};

	this.toUser = function (){
		return {
		    entityId: this.id,
		    properties: {
			   interests: this.pio_interests
		    },
		    eventTime: new Date(this.created_at).toISOString()
	  	};
	};

	this.toEvent = function (){
		return {
			entityId: this.event_id,
		  	properties: {
			  	types: this.pio_interests
		  	},
		  	eventTime: new Date(this.created_at).toISOString()
		}
	};

	this.toRating = function (){
		return {
		  	uid: this.id,
		  	iid: this.event_id,
		  	event: 'rate',
		  	properties: {
		  		'rating': this.rating * 1.000000
		  	},
		  	eventTime: new Date(this.created_at).toISOString()
		}
	};
});