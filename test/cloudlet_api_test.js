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


      test.equals('CREATE',      actual.dao_actions[0].action,                "should be 'CREATE'"     )
      test.equals('POST',        actual.dao_actions[1].action,                "should be 'POST'"       )
      test.equals('dmc',         actual.dao_actions[1].object_data.alias,     "should be dmc"          )
      test.equals('dm@tssg.org', actual.dao_actions[1].object_data.username,  "should be dm@tssg.org"  )
      test.equals(true,          actual.mongrel_resp.value,                   "should be true"         )
      test.equals('123123',      actual.clients[0].uuid,                      "should be 123123"       )
      test.equals('345345345',   actual.clients[0].connId,                    "should be 345345345"    )
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
         },
         json    : {
         }
      }

      var actual = openi_cloudlet_api.processMongrel2Message(testInput)

      test.equals('DELETE',      actual.dao_actions[0].action,                "should be 'DELETE'"     )
      test.equals(true,          actual.mongrel_resp.value,                   "should be true"         )
      test.equals('123123',      actual.clients[0].uuid,                      "should be 123123"       )
      test.equals('345345345',   actual.clients[0].connId,                    "should be 345345345"    )
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


      test.equals('FETCH',       actual.dao_actions[0].action,                "should be 'FETCH'"     )
      test.equals(true,          actual.mongrel_resp.value,                   "should be true"      )
      test.equals('123123',      actual.clients[0].uuid,                      "should be 123123"    )
      test.equals('345345345',   actual.clients[0].connId,                    "should be 345345345" )
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
