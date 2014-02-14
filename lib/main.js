/*
 * openi_data_api
 * openi-ict.eu
 *
 * Copyright (c) 2013 dmccarthy
 * Licensed under the MIT license.
 */

'use strict';

var zmq    = require('m2nodehandler');
var helper = require('./helper.js');

var cloudletApi = function(config){

   helper.init(config.logger_params)

   var senderToDao = zmq.sender(config.dao_sink);

   zmq.receiver(config.mongrel_handler.source, function(msg) {

      var daoMsg          = helper.processMongrel2Message(msg);
      daoMsg.mongrel_sink = config.mongrel_handler.sink

      senderToDao.send(daoMsg);
   });

}


module.exports = cloudletApi