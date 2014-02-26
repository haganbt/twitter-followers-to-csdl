'use strict';
var utils    = require('./utils')
    , ds     = require('./datasift')
    , store   = [1234] // store all user ids
    ;

module.exports = {

    //todo - this should be async
    process : function(name, data) {

        if( Object.prototype.toString.call( data ) === '[object Object]' ) {

           utils.saveFile(name, this.getIds(data));
           /*
           
          	this.getStreamHash(this.getCsdl(data) , function(err, res){
	        	if (err)
	            	throw err;


	            console.log("Output from datasift: "+ JSON.stringify(res));
	    	});
           
           */
        }
    },

    /*
     * setStoreIds - save ids to memory
     *
     */
    setStoreIds : function(ids){
        if(typeof(ids) === 'object'){
            store.concat(ids);
            console.log(store);
            return true;
        }
        return false;
    },

    /*
     * getPayloadIds - extract the user ids from the Twitter
     * response object payload.
     *
     * @param object
     * @return object
     */
	getPayloadIds : function(data) {
      if(typeof(data) === 'object' && data.ids){
          return data.ids;
      }
      return false;
    },

    /*
     * getCsdl- Build a CSDL string of user ids
     *
     * @param object - response object from Twitter
     */
    getCsdl : function(data) {
        var ids = this.getPayloadIds(data);
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
	}
};