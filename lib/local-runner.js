/**
 * Created by dmccarthy on 14/11/2013.
 */


'use strict';

var cloudletApi = require('./main.js')

var params = {
   dao_sub_q               : {spec:'tcp://127.0.0.1:49994'                                         },
   mongrel_sub_q           : {spec:'tcp://127.0.0.1:49992', id:'mongrel_sub_q_data_1'              },
   cloudlet_api_sub_q      : {spec:'tcp://127.0.0.1:49991', id:'cloudlet_api_sub_q_cloudlet_1'     },
   cloudlet_api_mong_sub_q : {spec:'tcp://127.0.0.1:49993', id:'cloudlet_api_mong_sub_q_cloudlet_1'},
   logger_params : {
      'path'     : '/opt/openi/cloudlet_platform/logs/cloudlet_api',
      'log_level': 'debug',
      'as_json'  : false
   }
}


cloudletApi(params)