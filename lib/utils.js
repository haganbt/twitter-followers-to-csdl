var fs = require('fs');
var moment = require('moment');

/*
 * Write to the cache dir
 */
exports.saveFile = function (name, content) {
    fs.writeFile("./cache/" + name + '-' + moment().format('DDMMYYYY-HHmmss') + '.log', content, function(err) {
        if (err) {
            return console.log(err);
        }
        return true;
    });
},


/*
 * Check the chache dir is writable
 */
exports.validCache = function() {
	if (fs.existsSync('./cache')) {
		// try and write to the cache dir
		fs.writeFile("./cache/tmp.txt", "Testing cache dir is writable.", function(err) {
		    if(err) {
		        return false;
		    } else {
		    	fs.unlink('./cache/tmp.txt', function (err) {
			  		if (err){
			  			return false;
			  		} else {
			  			 return true;
			  		}	
				});
		    }
		}); 
	    return true; 
	} else {
		return false;
	}
};


/*
 * Load the default config
 */
exports.loadConfig = function() {
    var data = fs.readFileSync('./config.json'),
        myObj;
    try {
        myObj = JSON.parse(data);
        return myObj;
    }
    catch (err) {
        throw new Error('Error parsing JSON config file.')
    }
};


/*
* Merge objects into the first one
*/
exports.merge = function(defaults) {
  for(var i = 1; i < arguments.length; i++){
      for(var opt in arguments[i]){
          defaults[opt] = arguments[i][opt];
      }
  }
  return defaults;
};