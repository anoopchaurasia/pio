'use strict';
var config = JSON.parse(require("fs").readFileSync('config.json').toString('utf-8'));
process.on('uncaughtException', function(e){
	console.error(e);
});
function addUser(user_id) {
	if(!interests[user_id]) {
		return;
	}
	sendToPrediction(JSON.stringify({
		id: "u" + user_id,
		interest: [{interest: interests[user_id]}]
	}));
	addUser(++user_id);
}

function sendToPrediction (post_data) {
	 var post_options = {
		host: config.server.host,
		port: config.server.port,
		path: '/pio?method=adduser',
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


var interests = [
	"Management",
	"Business",
	"Sales",
	"Marketing",
	"Communication",
	"Microsoft Office",
	"Customer Service",
	"Training",
	"Microsoft Excel",
	"Project Management",
	"Designs",
	"Analysis",
	"Research",
	"Websites",
	"Budgets",
	"Organization",
	"Leadership",
	"Time Management",
	"Project Planning",
	"Computer Program",
	"Strategic Planning",
	"Business Services",
	"Applications",
	"Reports",
	"Microsoft Word",
	"Program Management",
	"Powerpoint",
	"Negotation",
	"Software",
	"Networking",
	"Offices",
	"English",
	"Data",
	"Education",
	"Events",
	"International",
	"Testing",
	"Writing",
	"Vendors",
	"Advertising",
	"Databases",
	"Technology",
	"Finance",
	"Retail",
	"accounting",
	"social media",
	"Teaching",
	"Engineering",
	"Performance Tuning",
	"Problem Solving",
	"Marketing Strategy",
	"Materials",
	"Recruiting",
	"Order Fulfillment",
	"Corporate Law",
	"Photoshop",
	"New business development",
	"Human resources",
	"Public speaking",
	"Manufacturing",
	"Internal Audit",
	"strategy",
	"Employees",
	"Cost",
	"Business Development",
	"Windows",
	"Public Relations",
	"Product Development",
	"Auditing",
	"Business Strategy",
	"Presentations",
	"Construction",
	"Real Estate",
	"Editing",
	"Sales Management",
	"Team Building",
	"Healthcare",
	"Revenue",
	"Compliance",
	"Legal",
	"Innovation",
	"Policy",
	"Mentoring",
	"Commercial Real Estate",
	"Consulting",
	"Information Technology",
	"Process Improvement",
	"Change management",
	"Heavy Equipment",
	"Teamwork",
	"Promotions",
	"Facilities Management"
];

addUser(0);


