'use strict'
var twitter     = require('./lib/twitter')
    , utils     = require('./lib/utils')
    , config    = utils.loadConfig()
    , processor = require('./lib/processor')
    , winston   = require('winston')
    ;
    ;

//variable to set whether to get followers, friends, or both
var command
var collection

// collect the twitter id or handle from the cmd
var args = process.argv.slice(2);
if (!args[0] || args[0] === '' || args[0] === 'undefined') {
    throw new Error('FAIL: You must specify a twitter id or handle after the script name.');
}
else if (!args[1] || args[1] === '' || args[1] === 'undefined') {
    args[1] = 'followers'
};

//set collection variable based on info pased in from terminal
if (args[1].toLowerCase() == "friends")
{
    collection = 2
    console.log("Retrieving friends");
}
else if (args[1].toLowerCase() == "both")
{
    collection = 1
    console.log("Retrieving friends and followers");
}
else
{
    collection = 0
    console.log("Retrieving followers");
}

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ level: config.log_level })
    ]
});


var twit = new twitter({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token_key,
    access_token_secret: config.access_token_secret
});

if (utils.validCache() === false) {
    new Error('FAIL: Could not write to the CACHE directory.');
}


if(collection<=1){
//console.log('getting followers');
twit.getFollowersIds(args[0], function (err, data) {

    if (err && err.statusCode === 429 && err.data) { // rate limit hit
        logger.info('      - '  + err.data);
    } else if (err) {
        throw err;
    }

    if (data) {
        processor.process(args[0], 'followers', data), function (err, data){
            logger.info(data);
        }
    }

});
}

if(collection>=1){
//console.log('getting friends');
twit.getFriendsIds(args[0], function (err, data) {

    if (err && err.statusCode === 429 && err.data) { // rate limit hit
        logger.info('      - '  + err.data);
    } else if (err) {
        throw err;
    }

    if (data) {
        processor.process(args[0], 'friends', data), function (err, data){
            logger.info(data);
        }
    }

});
}