import {Schema, SchemaMixed, isNumber} from './stigma'
import {ifError} from "assert";

let schema = {
      name      : 'string'
    , outdated  : 'boolean'
    , phone     : 'number'
    , desc      : ['optional','string']
    , itemsID   : ['array',function(value,key){ return value.every(isNumber) ? void 0 : '{ '+key+': array of numbers expected! }'}]
    , message   : 'function'
    , test      : /^\d\d\d-\d\d\d$/g
} as SchemaMixed<any>;

let target = {
      name      : 'James'
    , phone     : 9998887766
    , outdated  : true
    , desc      : null // missing - validateOf() has to return no errors here
    , itemsID   : [1,3,4,5]
    , message   : function () { return 'HELLO!' }
    , test      : '333-444'
    };

ifError(new Schema(schema).validateOf(target));
console.log('All tests passed successfully');