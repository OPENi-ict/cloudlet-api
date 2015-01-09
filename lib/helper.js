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
var zmq          = require('m2nodehandler');
var rrd          = require('openi_rrd');


var init = function(logger_params){
   this.logger  = openiLogger(logger_params);
};



var getCloudlet = function(msg, senderToClient){

   if ( msg.path === '/api/v1/cloudlets/all'){
      rrd.monitorIncrement('cloudlet_get_all')

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
               'resp_type'   : 'cloudlet',
               'group'       : false,
               'group_level' : 1,
               'reduce'      : true,
               'bucket'      : 'objects'
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

      var cloudletRestURL = '/api/v1/cloudlets/' + cloudletId;

      var cloudletDBObj = {
         "@id" : cloudletId
      };


      senderToClient.send(msg.uuid, msg.connId, zmq.status.OK_200, zmq.standard_headers.json, cloudletDBObj );

      return null
   }
};


var processMongrel2Message = function (msg, senderToClient) {

   this.logger.log('debug', 'process Mongrel 2 Message function');

   if (msg.headers.METHOD === 'GET'){
      return getCloudlet(msg, senderToClient);
   }
   else{
      this.logger.log('debug', 'Matching function wasn\'t found');
   }
};


module.exports.init                   = init;
module.exports.processMongrel2Message = processMongrel2Message;
