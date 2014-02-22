'use strict';
var utils    = require('./utils')
    , ds     = require('./datasift')
    ;

module.exports = {

    //todo - this should be async
    process : function(name, data) {
        if( Object.prototype.toString.call( data ) === '[object Array]' ) {
           utils.saveFile(name, data);
           
           
          	this.getStreamHash(this.getCsdl(data) , function(err, res){
	        	if (err)
	            	throw err; 
	            	
	            	
	            console.log("Output from datasift: "+ JSON.stringify(res));	
	    	});
           
           
        }
    },

	getIds : function(data) {
      if(typeof(data) === 'object' && data.ids){
          return data.ids;
      }
      return false;
    },

    getCsdl : function(data) {
      if(typeof(data) === 'object' && data.ids){
      	console.log("debug 2");
          return 'twitter.user.id in ' + JSON.stringify(data.ids);
      }
      console.log("debug 1");
      return false;
    },

    getNextCursorStr : function(data) {
      if(typeof(data) === 'object' && data.next_cursor_str){
          return data.next_cursor_str;
      }
      return false;
    },
	
	getStreamHash : function(csdl, cb){
		function callback(err, res) {
			if(!err){
				cb(false, res);
			} 
		}
		
		ds.doCompile(csdl, callback);
	},
};