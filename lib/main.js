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

zmq.addPreProcessFilter(function(msg, client){
   console.log(1);
});


zmq.addPreProcessFilter(function(msg, client){
   console.log(2);
});


zmq.addPreProcessFilter(function(msg, client){
   if ('/api/v1/cloudlets/alll' === msg.headers.PATH){
      client(msg.uuid, msg.connId, zmq.status.BAD_REQUEST_400, zmq.standard_headers.json, {'message':'Invalid JSON'});
   }
});


zmq.addPreProcessFilter(function(msg, client){
   if ('DELETE' === msg.headers.METHOD){
      client(msg.uuid, msg.connId, zmq.status.BAD_REQUEST_400, zmq.standard_headers.json, {'message':'DELETE method not allowed'});
   }
});


//zmq.addPostProcessFilter(function(msg){
//   msg.headers['Content-Type'] = 'text/plain; charset=utf-8'
//   msg.body                    = "Hello World!"
//})


var auth_public_key = '-----BEGIN PUBLIC KEY-----\n'+
   'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKT8kGk6ZNo3sC4IIo29leRLVD23T2r0\n'+
   'vWXBEkk2pV42HsxKAmPs789AGHH9XwbGpD7FvrcBWWgb65v32Hg/NGkCAwEAAQ==\n'+
   '-----END PUBLIC KEY-----';

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

   var senderToDao    = zmq.sender(config.dao_sink);
   var senderToClient = zmq.sender(config.mongrel_handler.sink);

   zmq.receiver(config.mongrel_handler.source, config.mongrel_handler.sink, function(msg) {

      if ( msg.headers.METHOD === 'GET' && msg.path === '/api/v1/cloudlets') {

         var tokenB64 = msg.headers.authorization;

         jwt.verify(tokenB64, auth_public_key, function(err, token) {

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