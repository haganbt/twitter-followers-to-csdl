var fs = require('fs');



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