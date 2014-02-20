var   vows 		= require('vows')
    , assert 	= require('assert')
    , utils     = require('../lib/utils')
    , ds        = require('../lib/datasift')
    ;

vows.describe('DataSift Features').addBatch({
    'compiling CSDL': {
         topic: function () {
	        return ds.doCompile('interaction.content any "apple"');
         },
        'returns TRUE': function (topic) {
        	assert.isObject(topic);
        }       
    }
}).export(module);