'use strict'
var twitter         = require('./lib/twitter')
    , utils 		= require('./lib/utils.js')
    , config		= utils.loadConfig()
    ;

var twit = new twitter({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token_key,
    access_token_secret: config.access_token_secret
});



twit.getFollowersIds(config.twitter_id_or_handle, function (err, data) {
    //if (err) { throw err; }
    //console.log(data);
});