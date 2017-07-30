import {Stigma, SchemaMixed, SchemaSingle, isNumber, SchemaIns} from './stigma';
import {ifError, ok, equal} from "assert";

    // Classic string rules
{
    let schema = {
          name      : new Stigma({
             first   : String
            ,second  : ['optional', String]
          })
        , outdated  : Boolean
        , phone     : Number
        , desc      : ['optional',String]
        , itemsID   : [Array,function(value,key){ return value.every(isNumber) ? void 0 : '{ '+key+': array of numbers expected! }'}]
        , message   : String
        , test      : /^\d\d\d-\d\d\d$/g
        , sonne     : 'required'
    } as SchemaMixed<any>;
    
    let target = {
          name      : {first: '1234', second:  '1234'}
        , phone     : 9998887766
        , outdated  : true
        , desc      : null // missing - validateOf() has to return no errors here
        , itemsID   : [1,3,4,5]
        , message   : 'Secret message here...'
        , test      : '333-444'
        , sonne     : 'ok, it is here'
        };
    let err: any = new Stigma(schema).validateOf(target);
        ifError(err);
}

{
    let err: any = new Stigma({name: String}).validateOf({name: 1});
        equal(!!err, true, err);
}
    // Nested rules test
{
    let schema = new Stigma({foo: new Stigma({bar: String})});


    [true, 999, {}, new RegExp('.*')].forEach(function (el) {
        let err: any = schema.validateOf({foo: {bar: el}})
        ok(err, err)
        return err
    });
}
    // New native rules declarations (by respective constructors)
{
    let err: any = new Stigma({foo: Boolean}).validateOf({foo: true         }); ifError(err);
        err      = new Stigma({foo: Number }).validateOf({foo: 1234         }); ifError(err);
        err      = new Stigma({foo: String }).validateOf({foo: 'abcd'       }); ifError(err);
        err      = new Stigma({foo: Date   }).validateOf({foo: new Date()   }); ifError(err);
        err      = new Stigma({foo: Array  }).validateOf({foo: []           }); ifError(err);
}
    // Nested schemas
{
    let schema: SchemaMixed<{set: {field: string}}> = {set: new Stigma<any>({field: ['string']})}
    let object    = {set: {field: '1234'} }
    let err       = new Stigma(schema).validateOf(object)
        ifError(err)
}

console.log('All tests passed successfully!');