var http        = require('http')
    , utils 	= require('./utils')
    , config	= utils.loadConfig()
    ;


exports.doCompile = function(csdl, callback){

    var csdl = 'csdl='+encodeURIComponent(csdl);
    var options = {
        host: 'api.datasift.com',
        path: '/v1/compile?' + csdl,
        port: '80',
        body: 'csdl='+csdl,
        headers: {'Authorization': config.ds_username + ':' + config.ds_api_key}
    };

    callback = function(response) {
        var str = ''
        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            console.log(str);
        });

        response.on('error',function(e){
            console.log("Error: " + hostNames[i] + "\n" + e.message);
            console.log( e.stack );
        });

    }

    var req = http.request(options, callback);
    req.end();

    return this;






};