fm.Package('app.pio');
fm.Class("Rate", function (me){

	this.Rate = function (event, user, rating){
		this.event_id = event.id;
		this.user_id = user.id;
		this.rating = rating;
		this.created_at = new Date().toISOString()
	};

	this.toRating  = function () {
		return {
		  	uid: this.user_id,
		  	iid: this.event_id,
		  	event: 'rate',
		  	properties: {
		  		'rating': this.rating * 1.000000
		  	},
		  	eventTime: new Date(this.created_at).toISOString()
		}
	};
});