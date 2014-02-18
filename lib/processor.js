'use strict';

module.exports = {

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
  },  
  
};
