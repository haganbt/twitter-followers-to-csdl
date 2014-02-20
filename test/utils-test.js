var   vows 		= require('vows')
    , assert 	= require('assert')
    , utils     = require('../lib/utils')
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
    'validate a file can be saved': {
         topic: function () { 
	        return utils.saveFile('test-file.txt', 'Test content');
         },
        'returns TRUE': function (topic) {
        	assert.isTrue(topic);
        }
    }
}).export(module);