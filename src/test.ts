import {Schema, SchemaMixed, isNumber} from './stigma'
import {ifError, ok} from "assert";

let schema = {
      name      : new Schema({
         first   : 'string'
        ,second  : ['optional','string']
      })
    , outdated  : 'boolean'
    , phone     : 'number'
    , desc      : ['optional','string']
    , itemsID   : ['array',function(value,key){ return value.every(isNumber) ? void 0 : '{ '+key+': array of numbers expected! }'}]
    , message   : 'function'
    , test      : /^\d\d\d-\d\d\d$/g
} as SchemaMixed<any>;

let target = {
      name      : {first: '1234', second:  '1234'}
    , phone     : 9998887766
    , outdated  : true
    , desc      : null // missing - validateOf() has to return no errors here
    , itemsID   : [1,3,4,5]
    , message   : function () { return 'HELLO!' }
    , test      : '333-444'
    };

ifError(new Schema(schema).validateOf(target));
ok(new Schema({name: 'string'}).validateOf({name: 1 }));
console.log('All tests passed successfully');