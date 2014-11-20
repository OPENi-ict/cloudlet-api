/*
 * openi_data_api
 * openi-ict.eu
 *
 * Copyright (c) 2013 dmccarthy
 * Licensed under the MIT license.
 */

'use strict';

var dbc          = require('dbc');
var openiLogger  = require('openi-logger');
var openiUtils   = require('openi-cloudlet-utils');
var url          = require('url');



var init = function(logger_params){
   this.logger  = openiLogger(logger_params);
};


var postCloudlet = function(msg){

   dbc.assert(null !== msg.json);
   var cloudletId, cloudletRestURL, cloudletDBObj;


   cloudletId      = openiUtils.getCloudletId(msg.token);
   cloudletRestURL = "http://" + msg.headers.host + '/api/v1/cloudlets/' + cloudletId;

   cloudletDBObj = {
      id             : cloudletId,
      location       : cloudletRestURL,
      alias          : msg.json.alias,
      username       : msg.json.username,
      _date_created  : new Date().toJSON()
   };

   return {
      'dao_actions'      : [
         {
            'action'      : 'POST',
            'database'    : cloudletId,
            'object_name' : 'meta',
            'object_data' : cloudletDBObj,
            'resp_type'   : 'cloudlet',
            'id'          : cloudletId
         }
      ],
      'clients'      : [
         {
            'uuid' : msg.uuid,
            'connId' : msg.connId
         }
      ]
   };

};


var deleteCloudlet = function(msg){

   var cloudletId = openiUtils.extractCloudletId(msg.path);


   return {
      'dao_actions'      : [
         {
            'action' : 'DELETE',
            'database': cloudletId
         }
      ],
      'clients'      : [
         {
            'uuid' : msg.uuid,
            'connId' : msg.connId
         }
      ]
   };
};


var getCloudlet = function(msg){

   if ( msg.path === '/api/v1/cloudlets/all'){

      var url_parts = url.parse(msg.headers.URI, true);
      var query     = url_parts.query;

      var limit  = (undefined !== query.limit)  ? Number(query.limit)   : 30;
      var offset = (undefined !== query.offset) ? Number(query.offset)  :  0;
      var prev   = msg.headers.URI.replace("offset="+offset, "offset="+ (((offset - limit) < 0) ? 0 : (offset - limit)));
      var next   = msg.headers.URI.replace("offset="+offset, "offset="+ (offset + limit));

      var meta = {
         "limit"       : limit,
         "offset"      : offset,
         "total_count" : 0,
         "prev"        : (0 === offset)? null : prev,
         "next"        : next
      };

      return {
         'dao_actions'      : [
            {
               'action'      : 'VIEW',
               'design_doc'  : 'cloudlets_views',
               'view_name'   : 'cloudlet_list',
               'meta'        : meta,
               'filter_show' : query.only_show_properties,
               'resp_type'   : 'cloudlet'
            }
         ],
         'clients'      : [
            {
               'uuid' : msg.uuid,
               'connId' : msg.connId
            }
         ]
      };
   }
   else {

      var cloudletId      = openiUtils.getCloudletId(msg.token);

      if (!cloudletId){
         return {'error' : 'Invalid Auth token: Invalid signature.'};
      }

      var cloudletRestURL = "http://" + msg.headers.host + '/api/v1/cloudlets/' + cloudletId;

      var cloudletDBObj = {
         id             : cloudletId,
         location       : cloudletRestURL,
         username       : msg.token.user_name,
         email          : msg.token.email,
         _date_created  : new Date().toJSON()
      };

      return {
         'dao_actions'      : [
            {
               'action'      : 'GET_OR_POST',
               'database'    : cloudletId,
               'object_name' : 'meta',
               'object_data' : cloudletDBObj,
               'token'       : msg.token,
               'resp_type'   : 'cloudlet',
               'id'          : cloudletId
            }
         ],
         'clients'      : [
            {
               'uuid' : msg.uuid,
               'connId' : msg.connId
            }
         ]
      };
   }
};


var processMongrel2Message = function (msg) {

   this.logger.log('debug', 'process Mongrel 2 Message function');

   this.logger.log('debug', msg);

   if (     msg.headers.METHOD === 'POST'){
      return postCloudlet(msg);
   }
   else if (msg.headers.METHOD === 'DELETE'){
      return deleteCloudlet(msg);
   }
   else if (msg.headers.METHOD === 'GET'){
      return getCloudlet(msg);
   }
   else{
      this.logger.log('debug', 'Matching function wasn\'t found');
   }
};


module.exports.init                   = init;
module.exports.processMongrel2Message = processMongrel2Message;