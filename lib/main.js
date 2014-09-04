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

   var senderToDao    = zmq.sender(config.dao_sink);
   var senderToClient = zmq.sender(config.mongrel_handler.sink)

   zmq.receiver(config.mongrel_handler.source, config.mongrel_handler.sink, function(msg) {
      var daoMsg = helper.processMongrel2Message(msg);

      if (undefined !== daoMsg.error){
         var resp = zmq.Response(zmq.status.BAD_REQUEST_400, zmq.header_json, daoMsg)
         senderToClient.send(msg.uuid, msg.connId, resp);
      }
      else{
         daoMsg.mongrel_sink = config.mongrel_handler.sink
         senderToDao.send(daoMsg);
      }
   });

}


module.exports = cloudletApi