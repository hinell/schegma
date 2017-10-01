import {Stigma, SchemaMixed, SchemaSingle, isNumber, SchemaIns} from './stigma';
import {ifError, ok, equal} from "assert";

{
    let schema = {
          name      : String
        , outdated  : Boolean
        , phone     : Number
        , desc      : ['optional',String]
        , itemsID   : [Array,function(value,key){ return value.every(isNumber) ? void 0 : '{ '+key+': array of numbers is expected! }'}]
        , message   : String
        , test      : /^\d\d\d-\d\d\d$/g
        , sonne     : 'required'
    } as SchemaMixed<any>;
    
    let target = {
          name      : 'Father of god'
        , phone     : 9998887766
        , outdated  : true
        , desc      : null // missing - validateOf() has to return no errors here
        , itemsID   : [1,3,4,5]
        , message   : 'Secret message here...'
        , test      : '333-444'
        , sonne     : 'ok, it is here'
        };
    let err: any = new Stigma(schema).validateOf(target, true);
        debugger
        ifError(err);
        console.log('passed: classic string rules')
}
{
    let schema = new Stigma({foo: {bar: String} });

  
    [true, 999, {}, new RegExp('.*')].forEach(function (el) {
        let err: any = schema.validateOf({foo: {bar: el}}, true)
        ok(err, err)
        console.log(`passed: ${el.toString()}`)
        return err
    });
    console.log('passed: nested rules test');
}
{
    let err: any = new Stigma({foo: Boolean}).validateOf({foo: true         }, true); ifError(err);
        err      = new Stigma({foo: Number }).validateOf({foo: 1234         }, true); ifError(err);
        err      = new Stigma({foo: String }).validateOf({foo: 'abcd'       }, true); ifError(err);
        err      = new Stigma({foo: Date   }).validateOf({foo: new Date()   }, true); ifError(err);
        err      = new Stigma({foo: Array  }).validateOf({foo: []           }, true); ifError(err);
        console.log('passed: new native rules declarations (by respective constructors)');
}
{
    // there is well-known bug with nested stigma types schemas
    // like one here below where nested new Stigma({field: ... }) schema is
    // asserted by the <any> assertion to make sure typescript passes type check
    
    let schema: SchemaMixed<{set: {field: string}}> = {set: new Stigma<any>({field: [String]})}
    let object    = {set: {field: '1234'} }
    let err       = new Stigma(schema).validateOf(object, true)
        ifError(err);
        console.log('passed: nested schemas');
}
{
  
    Promise.all([
      new Stigma({ foo: String }).validateOf({ foo: 'ok' }),
      new Stigma({ foo: String }).validateOf({ foo: new Error() }).catch(err => err)
    ])
    .then(function ([,err]){
      ok(err instanceof Error);
      console.log('passed: promised valueOf');
    },err => console.log(err))
}
