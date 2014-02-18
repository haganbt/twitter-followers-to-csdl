var   vows 		= require('vows')
    , assert 	= require('assert')
    , utils   = require('../lib/utils')
    ;

vows.describe('Testing utils features').addBatch({
    'validate cache dir exists and is writable': {
         topic: function () {
	        return utils.validCache();
         },
        'returns TRUE': function (topic) {
        	assert.isTrue(topic);
        }       
   },
   /*
    'loading a processor that exists': {
         topic: function () { 
	        return utils.loadProcessor('example');
         },
        'the specified processor is returned': function (topic) {
        	assert.isFunction(topic);
        	assert.deepEqual(topic.name, 'Example');
        }
    },    
    */
}).export(module);