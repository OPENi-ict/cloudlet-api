/*
 * openi_data_api
 * openi-ict.eu
 *
 * Copyright (c) 2013 dmccarthy
 * Licensed under the MIT license.
 */

'use strict';

var dbc          = require('dbc');
var openiLogger  = require('openi-logger')
var openiUtils   = require('openi-cloudlet-utils')
var url          = require('url')


var init = function(logger_params){
   this.logger = openiLogger(logger_params);
}


var createCloudlet = function(msg){

   dbc.assert(null !== msg.json)

   var cloudletId      = 'c_' + openiUtils.randomHash();
   var cloudletRestURL = "http://" + msg.headers.host + '/api/v1/cloudlets/' + cloudletId;

   var cloudletDBObj = {
      id             : cloudletId,
      location       : cloudletRestURL,
      alias          : msg.json.alias,
      username       : msg.json.username,
      _date_created  : new Date().toJSON()
   }

   return {
      'dao_actions'      : [
         {
            'action'       : 'POST',
            'database'    : cloudletId,
            'object_name' : 'meta',
            'object_data' : cloudletDBObj,
            'resp_type'   : 'cloudlet',
            'id'          : cloudletId
         }
      ],
      'clients'      : [
         {'uuid' : msg.uuid, 'connId' : msg.connId }
      ]
   }
}


var deleteCloudlet = function(msg){

   var cloudletId = msg.path.replace('/api/v1/cloudlets/', '')

   var responseObject = {
      value      : true,
      data       : {
         cloudletId : cloudletId
      }
   }

   return {
      'dao_actions'      : [
         { 'action' : 'DELETE', 'database': cloudletId }
      ],
      'clients'      : [
         {'uuid' : msg.uuid, 'connId' : msg.connId }
      ]
   }
}


var exportCloudlet = function(msg){

   if ( msg.path === '/api/v1/cloudlets'){

      var url_parts = url.parse(msg.headers.URI, true);
      var query     = url_parts.query;
      var viewName  = 'cloudlet_list';

      if ('true' === query.id_only){
         viewName  = 'cloudlet_id_list';
      }

      return {
         'dao_actions'      : [
            {
               'action'       : 'VIEW',
               'design_doc'  : 'cloudlets_views',
               'view_name'   : viewName,
               'count'       : Number(query.limit),
               'skip'        : Number(query.skip),
               'filter_show' : query.only_show_properties,
               'resp_type'   : 'cloudlet'
            }
         ],
         'clients'      : [
            {'uuid' : msg.uuid, 'connId' : msg.connId }
         ]
      }
   }
   else{
      var cloudletId = msg.path.replace('/api/v1/cloudlets/', '')

      console.log(cloudletId)

      return {
         'dao_actions'      : [
            { 'action' : 'GET', 'database': cloudletId, 'object_name': {}, 'resp_type':'cloudlet' }
         ],
         'clients'      : [
            {'uuid' : msg.uuid, 'connId' : msg.connId }
         ]
      }
   }

}


var processMongrel2Message = function (msg) {

   this.logger.log('debug', 'process Mongrel 2 Message function')

   this.logger.logMongrel2Message(msg)

   if (     msg.headers.METHOD === 'POST'){
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