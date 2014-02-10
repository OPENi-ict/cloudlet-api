'use strict';

var base_path          = require('./basePath.js');
var openi_cloudlet_api = require(base_path + '../lib/helper.js');


openi_cloudlet_api.init({
   'path'     : 'build/data_api',
   'log_level': 'debug',
   'as_json'  : false
})

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/



exports['testProcessMongrel2'] = {

   'create Cloudlet'   : function(test) {
      // tests here
      var testInput     = {
         uuid    : '123123',
         connId  : '345345345',
         path    : '/api/v1/cloudlets',
         headers : {
            QUERY  : 'a=b&c=d',
            METHOD : 'POST'
         },
         body    : {
            "alias": "dmc",
            "username": "dm@tssg.org"
         },
         json    : {
            "alias": "dmc",
            "username": "dm@tssg.org"
         }
      }

      var actual = openi_cloudlet_api.processMongrel2Message(testInput);

      test.equals(actual.action,                'CREATE',                                    "should be 'CREATE'"     )
      test.equals(actual.object_data.alias,     'dmc',                                       "should be dmc"          )
      test.equals(actual.object_data.username,  'dm@tssg.org',                               "should be dm@tssg.org"  )
      test.equals(actual.mongrel_resp.value,    true,                                        "should be true"         )
      test.equals(actual.clients[0].uuid,       '123123',                                    "should be 123123"       )
      test.equals(actual.clients[0].connId,     '345345345',                                 "should be 345345345"    )
      test.done();
   },
   'delete Cloudlet'   : function(test) {
      // tests here
      var testInput     = {
         uuid    : '123123',
         connId  : '345345345',
         path    : '/api/v1/cloudlets/asdasdasdasdasd',
         headers : {
            QUERY  : 'a=b&c=d',
            METHOD : 'DELETE'
         },
         body    : {
            "alias": "dmc",
            "username": "dm@tssg.org"
         },
         json    : {
            "alias": "dmc",
            "username": "dm@tssg.org"
         }
      }

      var actual = openi_cloudlet_api.processMongrel2Message(testInput);

      test.equals(actual.action,             'DELETE',                                    "should be 'DELETE'"        )
      test.equals(actual.cloudlet,           'asdasdasdasdasd',                           "should be asdasdasdasdasd" )
      test.deepEqual(actual.object_data,     {},                                          "should be empty object"    )
      test.deepEqual(actual.mongrel_resp,    { value: true, cloudletId: 'asdasdasdasdasd' }, "should be { value: true, cloudletId: 'asdasdasdasdasd' }")
      test.equals(actual.clients[0].uuid,    '123123',                                    "should be 123123"          )
      test.equals(actual.clients[0].connId,  '345345345',                                 "should be 345345345"       )
      test.done();
   },
   'export Cloudlet'   : function(test) {
      // tests here
      var testInput     = {
         uuid    : '123123',
         connId  : '345345345',
         path    : '/api/v1/cloudlets/234234234234',
         headers : {
            QUERY  : 'a=b&c=d',
            METHOD : 'GET'
         },
         body    : {
            "alias": "dmc",
            "username": "dm@tssg.org"
         },
         json    : {
            "alias": "dmc",
            "username": "dm@tssg.org"
         }
      }



      var actual = openi_cloudlet_api.processMongrel2Message(testInput);

      test.equals(actual.action,             'FETCH',                                     "should be 'FETCH'"      )
      test.equals(actual.cloudlet,           '234234234234',                              "should be 345345345"    )
      test.deepEqual(actual.object_name,        {},                                          "should be Empty Object" )
      test.deepEqual(actual.mongrel_resp,       { value: true, cloudletId: '234234234234' }, "should be { value: true, cloudletId: '234234234234' }")
      test.equals(actual.clients[0].uuid,    '123123',                                    "should be 123123"       )
      test.equals(actual.clients[0].connId,  '345345345',                                 "should be 345345345"    )
      test.done();
   },
   'Malformed'   : function(test) {
      // tests here
      var testInput     = {
         uuid    : '123123',
         connId  : '345345345',
         path    : '/api/v1/cloudlets/234234234234',
         headers : {
            QUERY  : 'a=b&c=d',
            METHOD : 'AAA'
         },
         body    : {
            "alias": "dmc",
            "username": "dm@tssg.org"
         },
         json    : {
            "alias": "dmc",
            "username": "dm@tssg.org"
         }
      }

      var actual = openi_cloudlet_api.processMongrel2Message(testInput);

      test.equal(actual, null)

      test.done();
   }
}
