import {Stigma, SchemaMixed, SchemaSingle, isNumber} from './stigma'
import {ifError, ok} from "assert";

let schema: SchemaMixed<any> =  {
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
}

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
ok(err = new Stigma<any>({name: 'string'}).validateOf({name: 1 }),err);
}
{
let schematictest = new Stigma<any>({foo: new Stigma({bar: 'string'}) });

[true,999,{},new RegExp('.*')].every(function (el){
    let err = <any> schematictest.validateOf({foo: {bar: el}})
    ok(err,err)
    return err
} )

}
console.log('All tests passed successfully');