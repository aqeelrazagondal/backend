
var oneSignalConfig = require('../config/OneSignalConfig');
//var logger = require('../config/lib/logger.js');


var https = require('https');
 var headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": "Basic OWU2NTgxNDUtOTViNi00N2VmLWIyOWEtZGM0YzZhOGZlZWQ0",
	"EventName":null
  };
   var options = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "POST",
    headers: headers
  };


exports.sendNotifcationToPlayerId = function (playerId,obj){
	try{
		
	//setHeader ("EventName",eventName);
	headers.EventName="QAU Smart Ride";
	console.log ('playerId : '+playerId);
	var data = { 
	  app_id:oneSignalConfig.androidAppiId,
	  contents: {"en": obj},
	  headings:{"en":"QAU Smart Ride"},
	  include_player_ids: [playerId],
	  // data:obj,
	  priority:10,
  
	//will need to change for ios
	android_group:"QAU Smart Ride",
	
	// for IOS
	content_available:true,
	mutable_content:true
	};
	
  var req = https.request(options, function(res) {  
    res.on('data', function(data) {
      console.log("Response before parsing : " + data);
	  
      console.log("Response after parsing : " + JSON.parse(data));
    });
  });
  
  req.on('error', function(e) {
    console.log("ERROR:");
    console.log(e);
  });
  
  req.write(JSON.stringify(data));
  req.end();

}catch (err){
	//	logger.info('An Exception Has occured in sendNotifcationToPlayerId method' + err);
	}
}
