'use strict'
var twitter     = require('./lib/twitter')
    , utils     = require('./lib/utils')
    , config    = utils.loadConfig()
    , processor = require('./lib/processor')
    ;

var twit = new twitter({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token_key,
    access_token_secret: config.access_token_secret
});

if (utils.validCache() === false) {
    new Error('FAIL: Could not write to the CACHE directory.');
}


twit.getFollowersIds(config.twitter_id_or_handle, function (err, data) {

    if (err && err.statusCode === 429 && err.data) { // rate limit hit
        console.log('  -- ' + err.data);
    } else if (err) {
        throw err;
    }

    if (data) {
        processor.process(config.twitter_id_or_handle, data), function (err, data){
            console.log(data);
        }
    }

});