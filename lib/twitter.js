var VERSION = '0.2.8',
  http = require('http'),
  querystring = require('querystring'),
  oauth = require('oauth'),
  Cookies = require('cookies'),
  Keygrip = require('keygrip'),
  streamparser = require('./parser'),
	util = require('util'),
	utils = require('./utils');
	keys = require('./keys');

function Twitter(options) {
  if (!(this instanceof Twitter)) return new Twitter(options);

  var defaults = {
    consumer_key: null,
    consumer_secret: null,
    access_token_key: null,
    access_token_secret: null,

    headers: {
      'Accept': '*/*',
      'Connection': 'close',
      'User-Agent': 'ntwitter/' + VERSION
    },


    secure: false, // force use of https for login/gatekeeper
    cookie: 'twauth',
    cookie_options: {},
    cookie_secret: null
  };
  this.options = utils.merge(defaults, options, keys.urls);

  this.oauth = new oauth.OAuth(
    this.options.request_token_url,
    this.options.access_token_url,
    this.options.consumer_key,
    this.options.consumer_secret,
    '1.0', null, 'HMAC-SHA1', null,
    this.options.headers);
}
Twitter.VERSION = VERSION;
module.exports = Twitter;

/*
 * GET
 */
Twitter.prototype.get = function(url, params, callback) {
  console.log("DEBUG: GET " + url + "  Params: " + JSON.stringify(params));	

  if (typeof params === 'function') {
    callback = params;
    params = null;
  }

  if ( typeof callback !== 'function' ) {
    throw new Error('FAIL: INVALID CALLBACK.');
    return this;
  }

  if (url.charAt(0) == '/')
    url = this.options.rest_base + url;

  this.oauth.get(url + '?' + querystring.stringify(params),
    this.options.access_token_key,
    this.options.access_token_secret,
  function(error, data, response) {
    if ( error && error.statusCode ) {
      var err = new Error('HTTP Error '
        + error.statusCode + ': '
        + http.STATUS_CODES[error.statusCode]);
      err.statusCode = error.statusCode;
      err.data = error.data;
      callback(err);
    } 
    else if (error) {
      callback(error);
    }
    else {
      try {
        var json = JSON.parse(data);
      } 
      catch(err) {
        return callback(err);
      }
      callback(null, json);
    }
  });
  return this;
};


/*
 * POST
 */
Twitter.prototype.post = function(url, content, content_type, callback) {
  if (typeof content === 'function') {
    callback = content;
    content = null;
    content_type = null;
  } else if (typeof content_type === 'function') {
    callback = content_type;
    content_type = null;
  }

  if ( typeof callback !== 'function' ) {
    throw new Error('FAIL: INVALID CALLBACK.');
    return this;
  }

  if (url.charAt(0) == '/')
    url = this.options.rest_base + url;

  // Workaround: oauth + booleans == broken signatures
  if (content && typeof content === 'object') {
    Object.keys(content).forEach(function(e) {
			if ( typeof content[e] === 'boolean' )
				content[e] = content[e].toString();
		});
  }
  
  this.oauth.post(url,
    this.options.access_token_key,
    this.options.access_token_secret,
    content, content_type,
  function(error, data, response) {
    if ( error && error.statusCode ) {
      var err = new Error('HTTP Error '
        + error.statusCode + ': '
        + http.STATUS_CODES[error.statusCode]
        + ', API message: ' + error.data);
      err.data = error.data;
      err.statusCode = error.statusCode;
      callback(err);
    } 
    else if (error) {
      callback(error);
    }
    else {
      try {
        var json = JSON.parse(data);
      } 
      catch(err) {
        return callback(err);
      }
      callback(null, json);
    }
  });
  return this;
};






/*
 * TWITTER 'O'AUTHENTICATION UTILITIES, INCLUDING THE GREAT
 * CONNECT/STACK STYLE TWITTER 'O'AUTHENTICATION MIDDLEWARE
 * and helpful utilities to retrieve the twauth cookie etc.
 */
Twitter.prototype.cookie = function(req) {
  var keys = null;

	//this make no sense !this.options.cookie_secret return always true or false
  //if ( !this.options.cookie_secret !== null )
	if(this.options.cookie_secret)
    keys = new Keygrip(this.options.cookie_secret);
  var cookies = new Cookies( req, null, keys )
  var getState = this.options.getState || function (req, key) {
    return cookies.get(key);
  };

  // Fetch the cookie
  try {
    var twauth = JSON.parse(getState(req, this.options.cookie));
  } catch (error) {
    var twauth = null;
  }
  return twauth;
};

Twitter.prototype.login = function(mount, success) {
  var self = this,
    url = require('url');

  // Save the mount point for use in gatekeeper
  this.options.login_mount = mount = mount || '/twauth';

  // Use secure cookie if forced to https and haven't configured otherwise
  if ( this.options.secure && !this.options.cookie_options.secure )
    this.options.cookie_options.secure = true;
  // Set up the cookie encryption secret if we've been given one
  var keys = null;
	//the same issue than above
  //if ( !this.options.cookie_secret !== null )
	if(this.options.cookie_secret)
    keys = new Keygrip(this.options.cookie_secret);
  // FIXME: ^ so configs that don't use login() won't work?

  return function handle(req, res, next) {
    // state
    var cookies = new Cookies( req, res, keys )
    var setState = self.options.setState || function (res, key, value) {
      cookies.set(key, value, self.options.cookie_options);
    };
    var clearState = self.options.clearState || function (res, key) {
      cookies.set(key);
    };

    var path = url.parse(req.url, true);

    // We only care about requests against the exact mount point
    if ( path.pathname !== mount ) return next();

    // Set the oauth_callback based on this request if we don't have it
    if ( !self.oauth._authorize_callback ) {
      // have to get the entire url because this is an external callback
      // but it's only done once...
      var scheme = (req.socket.secure || self.options.secure) ? 'https://' : 'http://',
        path = url.parse(scheme + req.headers.host + req.url, true);
      self.oauth._authorize_callback = path.href;
    }

    // Fetch the cookie
    var twauth = self.cookie(req);

    // We have a winner, but they're in the wrong place
    if ( twauth && twauth.user_id && twauth.access_token_secret ) {
      res.writeHead(302, {'Location': success || '/'});
      res.end();
      return;

    // Returning from Twitter with oauth_token
    } else if ( path.query && path.query.oauth_token && path.query.oauth_verifier && twauth && twauth.oauth_token_secret ) {
      self.oauth.getOAuthAccessToken(
        path.query.oauth_token,
        twauth.oauth_token_secret,
        path.query.oauth_verifier,
      function(error, access_token_key, access_token_secret, params) {
        // FIXME: if we didn't get these, explode
        var user_id = (params && params.user_id) || null,
          screen_name = (params && params.screen_name) || null;

        if ( error ) {
          // FIXME: do something more intelligent
          return next(500);
        } else {
          setState(res, self.options.cookie, JSON.stringify({
            user_id: user_id,
            screen_name: screen_name,
            access_token_key: access_token_key,
            access_token_secret: access_token_secret
          }));
          res.writeHead(302, {'Location': success || '/'});
          res.end();
          return;
        }
      });

    // Begin OAuth transaction if we have no cookie or access_token_secret
    } else if ( !(twauth && twauth.access_token_secret) ) {
      self.oauth.getOAuthRequestToken(
      function(error, oauth_token, oauth_token_secret, oauth_authorize_url, params) {
        if ( error ) {
          // FIXME: do something more intelligent
          return next(500);
        } else {
          setState(res, self.options.cookie, JSON.stringify({
            oauth_token: oauth_token,
            oauth_token_secret: oauth_token_secret
          }));
          res.writeHead(302, {
            'Location': self.options.authorize_url + '?'
              + querystring.stringify({oauth_token: oauth_token})
          });
          res.end();
          return;
        }
      });

    // Broken cookie, clear it and return to originating page
    // FIXME: this is dumb
    } else {
      clearState(res, self.options.cookie);
      res.writeHead(302, {'Location': mount});
      res.end();
      return;
    }
  };
}
;
Twitter.prototype.gatekeeper = function(failure) {
  var self = this,
    mount = this.options.login_mount || '/twauth';

  return function(req, res, next) {
    var twauth = self.cookie(req);

    // We have a winner
    if ( twauth && twauth.user_id && twauth.access_token_secret )
      return next();

    // I pity the fool!
    // FIXME: use 'failure' param to fail with: a) 401, b) redirect
    //        possibly using configured login mount point
    //        perhaps login can save the mount point, then we can use it?
    res.writeHead(401, {}); // {} for bug in stack
    res.end([
      '<html><head>',
      '<meta http-equiv="refresh" content="1;url=" + mount + "">',
      '</head><body>',
      '<h1>Twitter authentication required.</h1>',
      '</body></html>'
    ].join(''));
  };
};

Twitter.prototype.getFollowersIds = function(id, callback) {
  if (typeof id === 'function') {
    callback = id;
    id = null;
  }

  var params = { key: 'ids' };
  if (typeof id === 'string')
    params.screen_name = id;
  else if (typeof id === 'number')
    params.user_id = id;

  var url = '/followers/ids.json';
  this._getUsingCursor(url, params, callback);
  return this;
};


Twitter.prototype._getUsingCursor = function(url, params, callback) {
  var nc = nc || -1;
  var self = this,
    params = params || {},
    key = params.key || null,
    result = []
    ;

  // if we don't have a key to fetch, we're screwed
  if (!key)
    callback(new Error('FAIL: Results key must be provided to _getUsingCursor().'));
  delete params.key;

  // kick off the first request, using cursor -1
  params = utils.merge(params, {cursor:-1});

  this.get(url, params, fetch);

  function fetch(err, data) {
  	
  	// record the next cursor
	if(data && data.next_cursor_str && data.next_cursor_str !== '0' && data.next_cursor_str !== '-1'){
		//console.log("DEBUG: setting next cusrsor to - " + data.next_cursor_str);
		nc = data.next_cursor_str;
	}
  	
  	if (data && !err){
  		 // FIXME: what if data[key] is not a list?
  		if (data[key]) result = result.concat(data[key]);

	    if (data.next_cursor_str === '0') {
	      callback(null, data);
	    } else {
	      params.cursor = data.next_cursor_str;
	      self.get(url, params, fetch);
          callback(null, data);
	    }
  	}
  	
    if (err) {
      // Have we hit a rate limit?
      if(typeof(err) === 'object' && err.statusCode === 429){
          params.cursor = nc;
	      console.log("DEBUG: Waiting 60 seconds before retry...");
	      setTimeout(function() {
			    self.get(url, params, fetch);
			}, 60000);
          // todo - node-backoff would be useful here - https://github.com/MathieuTurcotte/node-backoff
      }
      return callback(err);
    }
  }
  return this;
};



