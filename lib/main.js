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

var cloudletApi = function(params){


   helper.init(params.logger_params)


   var daoPush = zmq.bindToPushQ({
      spec : params.dao_sub_q.spec
   });


   zmq.bindToMong2PullQ({
      spec : params.cloudlet_api_mong_sub_q.spec,
      id   : params.cloudlet_api_mong_sub_q.id
   }, function(msg) {

      var daoMsg = helper.processMongrel2Message(msg);

      daoPush.push(daoMsg);
   });

}


module.exports = cloudletApi