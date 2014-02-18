var   vows 		= require('vows')
    , assert 	= require('assert')
    , processor   = require('../lib/processor')
    ;

var testData ={
  "ids": [
    1198847737,
    63291065,
    1134736994,
    248359749,
    567233838,
    467602310
  ],
  "next_cursor": 1422295814475720700,
  "next_cursor_str": "1422295814475720712",
  "previous_cursor": -1427440395408150500,
  "previous_cursor_str": "-1427440395408150471"
};


vows.describe('Processing a successful data response').addBatch({
    'successfully extracts the id\'s from the response payload': {
         topic: function () {
	        return processor.getIds(testData);
         },
        'an obj is returned': function (topic) {
        	assert.isObject(topic);
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