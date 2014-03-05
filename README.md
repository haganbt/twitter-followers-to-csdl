twitter-followers-to-csdl
=========================

###Description
Collect follower id's for a specific Twitter handle or id and create a DataSift CSDL filter definition.

If a Twitter rate limit is hit, the script will retry every minute.

Two files are generated as output - one listing all collected user id's and the another listing all generated CSDL. This means that if the script is stopped before completion, all current data is persisted.

The script continuously tests the size of the collected user ids and compiles the data with DataSift once full (~0.7MB).

###Install

1) Rename ```example.config.json``` to ```config.json```

2) If you have not done so already, register an application at https://apps.twitter.com/ to generate access credentials.

2) Edit config.json and enter required details.

###Run Tests

```npm test```

###Usage

To run:

```node app.js```

All output data will be written to the ```/cache``` directory.


###todo

Pull request welcome for all improvements :)

 * Add logging levels
 * Make file write async
