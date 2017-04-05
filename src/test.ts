import {Stigma, SchemaMixed, SchemaSingle, isNumber} from './stigma'
import {ifError, ok} from "assert";

let schema = {
      name      : new Stigma({
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

ifError(new Stigma(schema).validateOf(target));
{
let err;
ok(err = new Stigma({name: 'string'}).validateOf({name: 1 }),err);
}
{
let schematictest = new Stigma({foo: new Stigma({bar: 'string'}) });

[true,999,{},new RegExp('.*')].every(function (el){
    let err = schematictest.validateOf({foo: {bar: el}})
    return ok(err,err)
} )

}
console.log('All tests passed successfully');