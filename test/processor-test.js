var   vows 		= require('vows')
    , assert 	= require('assert')
    , processor   = require('../lib/processor')
    ;

var testData ="1198847737,63291065,1134736994,248359749,567233838,467602310";

vows.describe('Processing a successful data response').addBatch({
    'successfully extracts the id\'s to create a CSDL string': {
         topic: function () {
	        return processor.getCsdl(testData);
         },
        'an string is returned': function (topic) {
            assert.isString(topic);
            assert.deepEqual(topic, 'twitter.user.id in [' + testData + ']');
        }       
   },
	'can compile CSDL from within the processor': {
         topic: function () {
	        return processor.getStreamHash(processor.getCsdl(testData), this.callback);
         },
        'an object is returned': function (topic) {
            assert.isObject(JSON.parse(topic));
        	//assert.isString(topic.hash);
        	//assert.deepEqual(topic.hash, '68b63c11b71ea32bf7ef4a425078e076');
        }       
   }
   
}).export(module);