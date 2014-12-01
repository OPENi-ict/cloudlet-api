/*
 * openi_data_api
 * openi-ict.eu
 *
 * Copyright (c) 2013 dmccarthy
 * Licensed under the MIT license.
 */

'use strict';

var jwt    = require('jsonwebtoken');
var zmq    = require('m2nodehandler');
var helper = require('./helper.js');
var rrd    = require('openi_rrd');


var processMessage = function(config, msg, senderToClient, senderToDao){
   var daoMsg = helper.processMongrel2Message(msg);

   if (undefined !== daoMsg && undefined !== daoMsg.error){
      senderToClient.send(msg.uuid, msg.connId, zmq.status.BAD_REQUEST_400, zmq.standard_headers.json, daoMsg);
   }
   else{
      daoMsg.mongrel_sink = config.mongrel_handler.sink;
      senderToDao.send(daoMsg);
   }
};


var cloudletApi = function(config){

   helper.init(config.logger_params);
   rrd.init("cloudlets");
   zmq.addPreProcessFilter(rrd.filter);

   var senderToDao    = zmq.sender(config.dao_sink);
   var senderToClient = zmq.sender(config.mongrel_handler.sink);

   zmq.receiver(config.mongrel_handler.source, config.mongrel_handler.sink, function(msg) {

      if ( msg.headers.METHOD === 'GET' && msg.path === '/api/v1/cloudlets') {

         var tokenB64 = msg.headers.authorization.replace("Bearer ", "");

         jwt.verify(tokenB64, config.trusted_security_framework_public_key, function(err, token) {

            if (undefined !== err && null !== err){
               senderToClient.send(msg.uuid, msg.connId, zmq.status.BAD_REQUEST_400, zmq.standard_headers.json, {"error":"Invalid token: " + err });
            }
            else {
               msg.token = token;
               processMessage(config, msg, senderToClient, senderToDao);
            }
         });
      }
      else {
         processMessage(config, msg, senderToClient, senderToDao);
      }
   });
};


module.exports = cloudletApi;