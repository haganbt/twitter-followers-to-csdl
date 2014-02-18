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
    if (err) {
        console.log("DEBUG: " + err);
    } else {

    }
    console.log("DATA: " + data);
});


var getFollowersIds = function(id, callback) {
    if (typeof id === 'function') {
        callback = id;
        id = null;
    }

    var params = { key: 'ids' };
    if (typeof id === 'string')
        params.screen_name = id;
    else if (typeof id === 'number')
        params.user_id = id;

    var url = '/followers/ids.json';
    twit._getUsingCursor(url, params, callback);
    return this;
}