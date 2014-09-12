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



var auth_public_key = '-----BEGIN PUBLIC KEY-----\n'+
   'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKT8kGk6ZNo3sC4IIo29leRLVD23T2r0\n'+
   'vWXBEkk2pV42HsxKAmPs789AGHH9XwbGpD7FvrcBWWgb65v32Hg/NGkCAwEAAQ==\n'+
   '-----END PUBLIC KEY-----'

var processMessage = function(config, msg, senderToClient, senderToDao){
   var daoMsg = helper.processMongrel2Message(msg);

   if (undefined !== daoMsg && undefined !== daoMsg.error){
      var resp = zmq.Response(zmq.status.BAD_REQUEST_400, zmq.header_json, daoMsg)
      senderToClient.send(msg.uuid, msg.connId, resp);
   }
   else{
      daoMsg.mongrel_sink = config.mongrel_handler.sink
      senderToDao.send(daoMsg);
   }
}

var cloudletApi = function(config){

   helper.init(config.logger_params)

   var senderToDao    = zmq.sender(config.dao_sink);
   var senderToClient = zmq.sender(config.mongrel_handler.sink)

   zmq.receiver(config.mongrel_handler.source, config.mongrel_handler.sink, function(msg) {

      if ( msg.headers.METHOD === 'GET' && msg.path === '/api/v1/cloudlets') {

         var tokenB64 = msg.headers.authorization

         jwt.verify(tokenB64, auth_public_key, function(err, token) {

            if (undefined !== err && null !== err){
               var resp = zmq.Response(zmq.status.BAD_REQUEST_400, zmq.header_json, {"error":"Invalid token: " + err })
               senderToClient.send(msg.uuid, msg.connId, resp);
            }
            else{
               msg.token = token
               processMessage(config, msg, senderToClient, senderToDao)
            }
         });
      }
      else {
         processMessage(config, msg, senderToClient, senderToDao)
      }
   });

}


module.exports = cloudletApi