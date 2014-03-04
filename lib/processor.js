'use strict';
var utils    = require('./utils')
    , ds     = require('./datasift')
    , store   = [] // store all user ids
    , processIdsRunning = false;
    ;

module.exports = {

    process : function (name, data) {

        if (Object.prototype.toString.call(data) === '[object Object]') {

            var objIds = this.getPayloadIds(data);

            // persist to memory
            this.setStoreIds(objIds);

            // todo - this should probably be async also
            utils.saveFile(name, objIds);

            /*
             * if were not already doing so,
             * build a list of ids  from the
             * store queue used to generate the csdl
             */
            var currentIds = false;
            if(processIdsRunning === false){
                currentIds = this.processStoredIds();
            }

            // process the stored id's
            if(currentIds !== false){

                this.getStreamHash(this.getCsdl('['+currentIds+']') , function(err, res){
                    if (err)
                        throw err;

                    console.log("Output from datasift: "+ JSON.stringify(res));
                });
            }
        }

    },


    /*
     * processStoredIds - process stored user id's
     *
     *
     */
    processStoredIds : function () {
        console.log('DEBUG: Stored id\'s count:  ' +  store.length);
        processIdsRunning = true;

        // check if we have an empty store queue
        if(this.getStoreCount() === 0 || Buffer.byteLength(store.toString(), 'utf8') < 400000){
            processIdsRunning = false;
            return false;
        }

        var processingIds = new Array();
        for (var i = 0; i < store.length; i++) {

            processingIds.push(store[i]);

            var citrus = store.slice(0, i);

            if(Buffer.byteLength(processingIds.toString(), 'utf8') >= 400000){
                console.log('DEBUG: Building CSDL with ' +  processingIds.length + ' user id\s');
                console.log('DEBUG: Stored id\'s still to be processed:  ' +  store.length);
                var returnIds = store.splice(0, i);
                processIdsRunning = false;
                this.callProcessStoredIds();
                console.log('DEBUG: Returning ids to process.*************');
                return returnIds;
            }
        }
        console.log('DEBUG: Returning from processor FALSE');
        processIdsRunning = false;
        return false;

        /*
        console.log('DEBUG: Stored id\'s count:  ' +  store.length);
        processIdsRunning = true;

        // check if we have an empty store queue
        if(this.getStoreCount() === 0){
            processIdsRunning = false;
            return false;
        }

        var processIds = new Array();
        // batch up the user ids we have in the store
        for (var i = 0; i < store.length; i=i+100) {
            //console.log(i);
            // check if we have filled up the max filter size (~0.7Mb - 734003)
            if(Buffer.byteLength(processIds.toString(), 'utf8') <= 600000 && i >= 1){
                var currentIds = store.splice(0, i);
                processIds = processIds.concat(currentIds);
                console.log('DEBUG: Building processIds... ' + (Buffer.byteLength(processIds.toString(), 'utf8')) + ' bytes   Size: ' + processIds.length);
            }
            if(Buffer.byteLength(processIds.toString(), 'utf8') > 600000){
                console.log('DEBUG: Building CSDL with ' +  processIds.length + ' user id\s');
                console.log('DEBUG: Stored id\'s still to be processed:  ' +  store.length);
                processIdsRunning = false;
                this.callProcessStoredIds();
                console.log('DEBUG: Returning ids to process.*************');
                return processIds;
            }
        }
        console.log('DEBUG: Returning from processor FALSE');
        processIdsRunning = false;
        return false;
        */
    },


    /*
     * processStoredIds - check if we still have
     * id\'s to process, and call the processor
     *
     * @return - void
     *
     */
    callProcessStoredIds : function () {
        console.log('DEBUG: Checking store for more id\'s to process...');
        if(this.getStoreCount() > 0){
            console.log('DEBUG: Calling store processor to process ' +  store.length + ' user id\s');
            this.processStoredIds();
        }
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
                store.push( ids[i] ); // append to end of array
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
        console.log('DEBUG: Compiling CSDL...');
		function callback(err, res) {
			if(!err){
				cb(false, res);
			}
            //console.log("Output from datasift: "+ JSON.stringify(res));
		}
		ds.doCompile(csdl, callback);
	}
};