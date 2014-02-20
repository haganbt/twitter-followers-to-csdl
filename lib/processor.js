'use strict';
var utils    = require('./utils')
    , ds     = require('./datasift')
    ;

module.exports = {


    //todo - this should be async
    process : function(name, data) {
        if( Object.prototype.toString.call( data ) === '[object Array]' ) {
            utils.saveFile(name, data);

            ds.doCompile('twitter.user.id in [' + data + ']' , function(err, res){

                if (err)
                    throw err;



            });




        }
    },

    getIds : function(data) {
      if(typeof(data) === 'object' && data.ids){
          return data.ids;
      }
      return false;
    },

    getNextCursorStr : function(data) {
      if(typeof(data) === 'object' && data.next_cursor_str){
          return data.next_cursor_str;
      }
      return false;
    }
  
};
