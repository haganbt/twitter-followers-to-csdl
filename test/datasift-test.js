var   vows 		= require('vows')
    , assert 	= require('assert')
    , utils     = require('../lib/utils')
    , ds        = require('../lib/datasift')
    ;

vows.describe('DataSift Features').addBatch({
    'compiling valid CSDL': {
        topic: function () {
	        return ds.doCompile('interaction.content any "apple"', this.callback);
         },
        'returns a hash object': function (topic) {
        	assert.isObject(topic);
        	assert.isString(topic.hash);
        }       
    },
	'throws an error with invalid CSDL': {
        topic: function () {
	        return ds.doCompile('foo', this.callback);
         },
        'returns a hash string': function (topic) {
        	assert.isObject(topic);
        	assert.deepEqual(topic.error, 'Invalid CSDL');
        }       
    }    
}).export(module);