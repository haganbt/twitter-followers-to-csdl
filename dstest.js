var http = require('http');
var csdl = 'csdl='+encodeURIComponent('interaction.content any "apple"');
var options = {
    host: 'api.datasift.com',
    path: '/v1/compile?' + csdl,
    port: '80',
    body: 'csdl='+csdl,
    headers: {'Authorization': 'benhagan:f8d66e12d1d91a1f960702d101207fdb'}
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