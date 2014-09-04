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
var NodeRSA      = require('node-rsa')
var nodeRsa      = null


var auth_public_key = '-----BEGIN PUBLIC KEY-----\n'+
   'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKT8kGk6ZNo3sC4IIo29leRLVD23T2r0\n'+
   'vWXBEkk2pV42HsxKAmPs789AGHH9XwbGpD7FvrcBWWgb65v32Hg/NGkCAwEAAQ==\n'+
   '-----END PUBLIC KEY-----'


var init = function(logger_params){
   this.logger  = openiLogger(logger_params);
   nodeRsa      = new NodeRSA(auth_public_key)
}

var getTokenObj = function(t_string){

   var t = JSON.parse(t_string)

   if (undefined === t.token){
      throw "Should have token"
   }
   if (undefined === t.token.user){
      throw "Should have user"
   }
   if (undefined === t.signature){
      throw "Should have signature"
   }

   return t
}

var postCloudlet = function(msg){

   dbc.assert(null !== msg.json)

   if (msg.path === '/api/v1/cloudlets/allow_access' ){
      var auth_token
      try {
         auth_token = getTokenObj(msg.headers.auth_token)
      }
      catch (e) {
         return {'error' : 'Invalid Auth token: Error parsing JSON'}
      }


      var cloudletId = tokenToCloudlet(auth_token)

      if (cloudletId){

         var verify = nodeRsa.verify(msg.json.token, msg.json.signature, 'utf-8', 'base64')

         var key        = msg.json.token.user + "-" + cloudletId
         var permission = {}
         permission[cloudletId] = 'r'

         if (verify){
            return {
               'dao_actions'      : [
                  {
                     'action'      : 'POST',
                     'bucket'      : 'permissions',
                     'database'    : key,
                     'object_data' : permission,
                     'resp_type'   : 'permission',
                     'id'          : 'success'
                  }
               ],
               'clients'      : [
                  {'uuid' : msg.uuid, 'connId' : msg.connId }
               ]
            }
         }
         else{
            return {'error' : 'Invalid Auth token, signature cannot be verified.'}
         }
      }

   }
   else if (msg.path === '/api/v1/cloudlets/revoke_access' ){
      var auth_token
      try {
         auth_token = getTokenObj(msg.headers.auth_token)
      }
      catch (e) {
         return {'error' : 'Invalid Auth token: Error parsing JSON'}
      }

      var cloudletId = tokenToCloudlet(auth_token)

      if (cloudletId){

         var verify = nodeRsa.verify(msg.json.token, msg.json.signature, 'utf-8', 'base64')
         var key        = msg.json.token.user + "-" + cloudletId

         if (verify){
            return {
               'dao_actions'      : [
                  {
                     'action'      : 'DELETE',
                     'bucket'      : 'permissions',
                     'database'    : key,
                     'resp_type'   : 'permission',
                     'id'          : 'success'
                  }
               ],
               'clients'      : [
                  {'uuid' : msg.uuid, 'connId' : msg.connId }
               ]
            }
         }
         else{
            return {'error' : 'Invalid Auth token, signature cannot be verified.'}
         }
      }

   }
   else{
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


var tokenToCloudlet = function(auth_token){

   var verify  = nodeRsa.verify(auth_token.token, auth_token.signature, 'utf-8', 'base64')
   var cidObj  = auth_token.token
   cidObj.seed = "Beware of Greeks bearing gifts"

   var str     = (verify) ? "c_" + openiUtils.hash(cidObj) : false

   delete cidObj.seed

   return str

}


var getCloudlet = function(msg){

   if ( msg.path === '/api/v1/cloudlets/all'){

      var url_parts = url.parse(msg.headers.URI, true);
      var query     = url_parts.query;
      var viewName  = 'cloudlet_list';

      if ('true' === query.id_only){
         viewName  = 'cloudlet_id_list';
      }

      return {
         'dao_actions'      : [
            {
               'action'      : 'VIEW',
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

      var auth_token
      try {
         auth_token = getTokenObj(msg.headers.auth_token)
      }
      catch (e) {
         return {'error' : 'Invalid Auth token: Error parsing JSON'}
      }

      var cloudletId      = tokenToCloudlet(auth_token)
      var cloudletRestURL = "http://" + msg.headers.host + '/api/v1/cloudlets/' + cloudletId;

      var cloudletDBObj = {
         id             : cloudletId,
         location       : cloudletRestURL,
         username       : auth_token.token.user,
         _date_created  : new Date().toJSON()
      }

      return {
         'dao_actions'      : [
            {
               'action'      : 'GET_OR_POST',
               'database'    : cloudletId,
               'object_name' : 'meta',
               'object_data' : cloudletDBObj,
               'token'       : auth_token.token,
               'resp_type'   : 'cloudlet',
               'id'          : cloudletId
            }
         ],
         'clients'      : [
            {'uuid' : msg.uuid, 'connId' : msg.connId }
         ]
      }
   }

}


var processMongrel2Message = function (msg) {

   this.logger.log('debug', 'process Mongrel 2 Message function')

   this.logger.log('debug', msg)

   if (     msg.headers.METHOD === 'POST'){
      return postCloudlet(msg)
   }
   else if (msg.headers.METHOD === 'DELETE'){
      return deleteCloudlet(msg)
   }
   else if (msg.headers.METHOD === 'GET'){
      return getCloudlet(msg)
   }
   else{
      this.logger.log('debug', 'Matching function wasn\'t found')
   }
}


module.exports.init                   = init
module.exports.processMongrel2Message = processMongrel2Message