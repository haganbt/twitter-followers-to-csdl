'use strict';
var utils    = require('./utils')
    , ds     = require('./datasift')
    ;

module.exports = {

    //todo - this should be async
    process : function(name, data) {

        if( Object.prototype.toString.call( data ) === '[object Object]' ) {

           var ids = this.getIds(data)

           utils.saveFile(name, ids);
           /*
           
          	this.getStreamHash(this.getCsdl(data) , function(err, res){
	        	if (err)
	            	throw err; 
	            	
	            	
	            console.log("Output from datasift: "+ JSON.stringify(res));	
	    	});
           
           */
        }
    },

	getIds : function(data) {
      if(typeof(data) === 'object' && data.ids){
          return data.ids;
      }
      return false;
    },

    /* getCsdl- Build a CSDL string of user ids
     *
     * @param object - response object from Twitter
     */
    getCsdl : function(data) {
        var ids = this.getIds(data);
        ids = typeof ids == 'object' ? JSON.stringify(ids) : ids;
  		return 'twitter.user.id in ' + ids + '';
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