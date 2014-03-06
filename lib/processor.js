'use strict';
var utils       = require('./utils')
    , ds        = require('./datasift')
    , store     = [] // store all user ids
    , processIdsRunning = false
    , hashArray = []
    , moment    = require('moment')
    , winston   = require('winston')
    , config    = utils.loadConfig()
    ;

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ level: config.log_level })
    ]
});



module.exports = {

    /*
     * process - process the incoming data
     *
     */
    process : function (name, data) {

        if (Object.prototype.toString.call(data) === '[object Object]') {

            var objIds = this.getPayloadIds(data);

            // persist to memory
            this.setStoreIds(objIds);

            logger.info('ID\'s stored to be processed:' +  store.length);

            // todo - this should be async also
            utils.saveFile(name + '-ids', "\n" + objIds + ',');

            // Process the user id's
            var currentIds = false;
            if (processIdsRunning === false) {
                // last response from twitter?
                if (data.next_cursor_str === '0') {
                    logger.debug('Last response from Twitter, cleanup store.');
                    currentIds = this.processStoredIds(true);
                } else {
                    currentIds = this.processStoredIds(false);
                }
            } else {
                logger.debug('Processor already running.');
            }


            // Send CSDL to DataSift
            if (currentIds !== false) {
                logger.info('Building CSDL and compiling filter.');
                var self = this;
                this.getStreamHash(this.getCsdl('[' + currentIds + ']'), function (err, res) {
                    if (err)
                        throw err;

                    var dataSiftResponse = JSON.parse(res);
                    logger.info('Saving new hash: ' + dataSiftResponse.hash);
                    self.setHash(dataSiftResponse.hash);
                    utils.saveFile(name + '.csdl', "\n\n" + moment().format('MMMM Do YYYY, h:mm:ss a') + ":\n" + self.getHashString());
                    logger.info('Final CSDL: ', self.getHashString());

                });
            }
        }

    },


    /*
     * processStoredIds - Looks at the store of user ids and returns
     * them when the CSDL filster size limit is exceeded.
     *
     * NOTE: This should be synchronous and the immutable while running.
     *
     * @param   - boolean - cleanup remaining ids
     * @return  - obj or FALSE when store empty or too small
     *
     */
    processStoredIds : function (cleanup) {
        processIdsRunning = true;
        logger.debug('Stored id\'s count:  ' +  store.length);

        // check if we have an empty store or store is too small (< ~0.7Mb)
        if ((this.getStoreCount() === 0 || Buffer.byteLength(store.toString(), 'utf8') < 734003) && cleanup !== true) {
            logger.debug('Store too small to process - Total: ' + store.length + '  Size: ' + Buffer.byteLength(store.toString(), 'utf8') + ' bytes.');
            processIdsRunning = false;
            return false;
        }

        // process the remaining few store ids
        if (cleanup === true) {
            // remove all ids from the store
            var cleanupIds = store.splice(0, store.length);
            processIdsRunning = false;
            return cleanupIds;
        } else {
            // temp store for ids to calc size
            var processingIds = new Array();
            for (var i = 0; i < store.length; i=i+100) {

                // copy the array items
                processingIds = store.slice(0, i);

                // CSDL filter size limit reached? (~0.7Mb)
                if(Buffer.byteLength(processingIds.toString(), 'utf8') >= 734003) {
                    logger.debug('Filter size limit exceeded. Returning ' + processingIds.length + ' id\'s');
                    // remove from the store
                    var returnIds = store.splice(0, i);
                    processIdsRunning = false;
                    this.callProcessStoredIds();
                    return returnIds;
                }
            }
        }

        logger.debug('Returning from processor FALSE');
        processIdsRunning = false;
        return false;
    },


    /*
     * callProcessStoredIds - check if we still have
     * id's to process, and call the processor once again
     *
     * @return - void
     *
     */
    callProcessStoredIds : function () {
        logger.debug('Checking store for more id\'s to process...');
        if(this.getStoreCount() > 0){
            logger.debug('Calling store processor to process ' +  store.length + ' user id\s');
            this.processStoredIds();
        }
    },


    /*
     * setHash - save the datasift hash
     *
     * @param - string - the stream hash
     *
     */
    setHash : function (hash){
        if (typeof(hash) === 'string') {
            hashArray.push(hash);
            return true;
        }
        return false;
    },


    /*
     * getHashString - get a csdl string of
     * all saved hash's.
     *
     * @return - string
     *
     */
    getHashString : function() {

        var hashString = '';

        if(hashArray.length === 0){
            return false;
        }

        if(hashArray.length === 1) {
            return 'stream "' + hashArray[0] + '"';
        }

        for (var i = 0; i < hashArray.length; i++) {
            hashString += 'stream "' + hashArray[i] + '" OR ';
        }
        hashString = hashString.substring(0, hashString.length -4);
        return hashString;

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



    /*
     * getStreamHash - compile CSDL
     *
     */
	getStreamHash : function(csdl, cb){

        logger.debug('getStreamHash called - compiling..');

		function callback(err, res) {
			if(!err){
				cb(false, res);
			}
            //console.log("Output from datasift: "+ JSON.stringify(res));
		}
		ds.doCompile(csdl, callback);
	}
};