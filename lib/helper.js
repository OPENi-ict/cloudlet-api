/*
 * openi_data_api
 * openi-ict.eu
 *
 * Copyright (c) 2013 dmccarthy
 * Licensed under the MIT license.
 */

'use strict';

var openiLogger  = require('openi-logger')
var openiUtils   = require('openi-cloudlet-utils')


var init = function(logger_params){
   this.logger = openiLogger(logger_params);
}


var createCloudlet = function(msg){

   var cloudletId = 'c_' + openiUtils.randomHash();

   var cloudletDBObj = {
      id       : cloudletId,
      alias    : msg.json.alias,
      username : msg.json.username
   }

   var responseObject = {
      value      : true,
      cloudletId : cloudletId
   }

   return {
      'action'       : 'CREATE',
      'cloudlet'  : cloudletId,
      'object_data'  : cloudletDBObj,
      'mongrel_resp' : responseObject,
      'clients'       : [
         {'uuid' : msg.uuid, 'connId' : msg.connId }
      ]
   }
}


var deleteCloudlet = function(msg){

   var cloudletId = msg.path.replace('/api/v1/cloudlets/', '')

   var responseObject = {
      value      : true,
      cloudletId : cloudletId
   }

   return {
      'action'       : 'DELETE',
      'cloudlet'  : cloudletId,
      'object_data'  : {},
      'mongrel_resp' : responseObject,
      'clients'       : [
         {'uuid' : msg.uuid, 'connId' : msg.connId }
      ]
   }
}


var exportCloudlet = function(msg){

   var cloudletId = msg.path.replace('/api/v1/cloudlets/', '')

   var responseObject = {
      value      : true,
      cloudletId : cloudletId
   }

   return {
      'action'       : 'FETCH',
      'cloudlet'     : cloudletId,
      'object_name'  : {},
      'mongrel_resp' : responseObject,
      'clients'       : [
         {'uuid' : msg.uuid, 'connId' : msg.connId }
      ]
   }

}


var processMongrel2Message = function (msg) {

   this.logger.log('debug', 'process Mongrel 2 Message function')

   this.logger.logMongrel2Message(msg)

   if (msg.headers.METHOD === 'POST'){
      return createCloudlet(msg)
   }
   else if (msg.headers.METHOD === 'DELETE'){
      return deleteCloudlet(msg)
   }
   else if (msg.headers.METHOD === 'GET'){
      return exportCloudlet(msg)
   }
   else{
      this.logger.log('debug', 'Matching function wasn\'t found')
   }
}


module.exports.init                   = init
module.exports.processMongrel2Message = processMongrel2Message