'use strict';
var utils    = require('./utils')
    , ds     = require('./datasift')
    , store   = [] // store all user ids
    ;

module.exports = {

    //todo - this should be async
    process : function(name, data) {

        if (Object.prototype.toString.call(data) === '[object Object]') {

            var objIds = this.getPayloadIds(data);

            // persist to memory
            this.setStoreIds(objIds);

            // persist to disk
            utils.saveFile(name, objIds);

            console.log('DEBUG: ID\'s retrieved - ' + this.getStoreCount());

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
     * @param - object
     * @return - boolean
     */
    setStoreIds : function(ids) {
        if (typeof(ids) === 'object') {
            for (var i in ids) {
                store.push( ids[i] );
            }
            return true;
        }
        return false;
    },


    /*
     * getStoreCount - counts how many ids we have in memory
     *
     * @return - int
     */
    getStoreCount : function() {
        return store.length;
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
     *
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