twitter-followers-to-csdl
=========================

###Description
Collect follower id's for a specific Twitter handle or id and create a DataSift CSDL filter definition.

If a Twitter rate limit is hit, the script will retry every minute.

Two files are generated as output - one listing all collected user id's and the another listing all generated CSDL. This means that if the script is stopped before completion, all current data is persisted.

The script continuously tests the size of the collected user ids and compiles the data with DataSift once full (~0.7MB).

See http://www.benh.co.uk/datasift/twitter-followers-to-datasift-filter/ for further info.

###Install & Config

1) Rename ```example.config.json``` to ```config.json```

2) If you have not done so already, register an application at https://apps.twitter.com/ to generate access credentials.

3) Edit config.json and enter the credentials as follows:

 * ```ds_username``` - DataSift username
 * ```ds_api_key``` - DataSift API key
 * ```consumer_key``` - Twitter Consumer Key
 * ```consumer_secret``` - Twitter Consumer Secret
 * ```access_token_key``` - Twitter Access Token Key
 * ```access_token_secret``` - Twitter Access Token Secret
 * ```log_level``` - info or debug


###Run Tests

```npm test```

###Usage

To run:

```node app.js <twitter_id_or_handle>```

All output data will be written to the ```/cache``` directory. Two files are created:

 * ```<twitter_handle>-ids.log`` - a list of all id's retrieved from Twitter.

 * ```<twitter_handle>.csdl.log`` - output generated CSDL of compiled filters.


###todo

Pull request welcome for all improvements :)

 * Make file write async
 * make retry backoff smarter
 * basic analytics
