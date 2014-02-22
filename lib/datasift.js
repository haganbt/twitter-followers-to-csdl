 var request = require('request')
    , utils 	= require('./utils')
    , config	= utils.loadConfig()
    ;


exports.doCompile = function(csdl, cb){
	console.log("DEBUG: Compiling CSDL.");
	var encCsdl = 'csdl='+encodeURIComponent(csdl);
	var options = {
	    url: 'http://api.datasift.com/v1/compile?' + encCsdl,
	    headers: {
	        'Authorization': config.ds_username + ':' + config.ds_api_key
	    }
	};
	
	function callback(error, response, body) {
	    if (!error && response.statusCode == 200) {
	         cb(false, JSON.parse(body));
	    }
	    
	    // catch bad csdl
	    if (!error && response.statusCode == 400 && response && response.body) {
	    	cb(false, {error:'Invalid CSDL'});
	   	}	
	    
		if(error){
			throw new Error(error);
		}

	}
	
	request(options, callback);

};