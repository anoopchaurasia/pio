fm.Package('app.pio');
fm.Class("Event", function (me){

	this.Event = function (event){
		this.id = event.id;
		this.sectors = event.sectors || [];
		this.functions = event.functions || [];
		this.tags = event.tags || [];
		this.created_at = event.created_at || new Date().toISOString();
		this.types = event.types || app.Pio.mergeArray(
			  		app.Pio.getNames(this, 'sectors'),
			  		app.Pio.getNames(this, 'functions'),
			  		this.tags.map(function(tag){return tag.name}));
		this.user_id = 'u' + this.id;
		this.rating = 5;
	};

	this.toEvent = function (){
		return {
			entityId: this.id,
		  	properties: {
			  	types: this.types
		  	},
		  	eventTime: new Date(this.created_at).toISOString()
		}
	};

	this.toUser = function (){
		return {
		    entityId: this.user_id,
		    properties: {
			   interests: this.types
		    },
		    eventTime: new Date(this.created_at).toISOString()
	  	};
	};

	this.toRating = function (){
		return {
		  	uid: this.user_id,
		  	iid: this.id,
		  	event: 'rate',
		  	properties: {
		  		'rating': this.rating * 1.000000
		  	},
		  	eventTime: new Date(this.created_at).toISOString()
		}
	};
});