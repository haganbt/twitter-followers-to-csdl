'use strict';
var utils    = require('./utils')
    , ds     = require('./datasift')
    , store   = [] // store all user ids
    ;

module.exports = {


    process : function (name, data) {

        if (Object.prototype.toString.call(data) === '[object Object]') {

            var objIds = this.getPayloadIds(data);

            // persist to memory
            this.setStoreIds(objIds);

            // persist to disk
            //todo - this should be async also
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
     * processStoredIds - process stored user id's
     *
     */
    processStoredIds : function () {
        if (this.getStoreCount() > 4) {
            //removes 1 element from index 3
            var removed = store.splice(0, 4);

            console.log('*** REMOVED: ' + this.getCsdl(removed));
        }
        return true;
    },


    /*
     * setStoreIds - save ids to memory
     *
     * @param - object - userids
     * @return - boolean
     */
    setStoreIds : function (ids) {
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
     * getStoreSize - return the byte size of the collected ids
     *
     * @return - float
     *
     */
    getStoreSize : function(data) {
        if (typeof(data) === 'object') {
            return Buffer.byteLength(data.toString(), 'utf8');
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
     * @param string or object - id's
     *
     */
    getCsdl : function(ids) {
        if(typeof ids == 'object' && ids.ids){
            ids = this.getPayloadIds(ids);
            ids = JSON.stringify(ids);
        }
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