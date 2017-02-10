#!/usr/bin/env node

/*
 * @version 0.3, 3 June 2014
 */

var elasticsearch = require('elasticsearch'),
  conf = require('./config'),
  fbutil = require('./lib/fbutil'),
  PathMonitor = require('./lib/PathMonitor'),
  SearchQueue = require('./lib/SearchQueue');

var escOptions = {
  hosts: [{
    host: conf.ES_HOST,
    port: conf.ES_PORT,
    auth: (conf.ES_USER && conf.ES_PASS) ? conf.ES_USER + ':' + conf.ES_PASS : null
  }],
  log: 'trace'
};

for (var attrname in conf.ES_OPTS) {
  if( conf.ES_OPTS.hasOwnProperty(attrname) ) {
    escOptions[attrname] = conf.ES_OPTS[attrname];
  }
}

var esc = new elasticsearch.Client({
  hosts: [{
    host: '35.185.220.17',
    port: '80',
    path: '/elasticsearch/',
    auth: (conf.ES_USER && conf.ES_PASS) ? conf.ES_USER + ':' + conf.ES_PASS : null
  }],
  log: 'trace'
});

var timeoutObj = setInterval(function() {
  esc.ping()
    .then(function() {
      console.log('Connected to ElasticSearch host %s:%s'.grey, conf.ES_HOST, conf.ES_PORT);
      clearInterval(timeoutObj);
      initFlashlight();
    });
}, 5000);

function initFlashlight() {
  fbutil.init(conf.FB_URL, conf.FB_SERVICEACCOUNT);
  PathMonitor.process(esc, conf.paths, conf.FB_PATH);
  SearchQueue.init(esc, conf.FB_REQ, conf.FB_RES, conf.CLEANUP_INTERVAL);
}