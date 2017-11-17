import {Stigma, Rules, SchemaMixed, isNumber, isObject} from './stigma';
import { equal, ok} from 'assert';
function ifError(err){if(err){
  let nerr = new Error();
    throw err
}}
/*function equal(v1,v2,m = ''){
  if(!v1 || !v2){ throw new Error('Invalid argument') }
  if(v1 != v2){
    if(isObject(v1)){ v1 = JSON.stringify(v1) }
    throw new Error(v1+' != '+v2+'\n'+m);
  }
}
function ok(v,m?){ equal(v,true,m) }*/
console.log('tests.js:');
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
    let err: any = new Rules(schema).validateOf(target, true);
        
        ifError(err);
        console.log('classical string rules ok')
}
{
    let schema = new Rules({foo: {bar: String} });

  
    [true, 999, {}, new RegExp('.*')].forEach(function (el) {
        let err: any = schema.validateOf({foo: {bar: el}}, true)
        ok(err, err)
        console.log(`${JSON.stringify(el)} ok`)
        return err
    });
    console.log('nested rules test ok');
}
{
    let err: any = new Rules({foo: Boolean}).validateOf({foo: true         }, true); ifError(err);
        err      = new Rules({foo: Number }).validateOf({foo: 1234         }, true); ifError(err);
        err      = new Rules({foo: String }).validateOf({foo: 'abcd'       }, true); ifError(err);
        err      = new Rules({foo: Date   }).validateOf({foo: new Date()   }, true); ifError(err);
        err      = new Rules({foo: Array  }).validateOf({foo: []           }, true); ifError(err);
        console.log('constructors as rules) ok');
}
{
    // there is well-known bug with nested types of stigma schemas instances
    // like this one below where nested new Stigma({field: ... }) schema is
    // asserted by the <any> assertion to make sure typescript passes type check
    
    let schema = new Rules({set: new Rules(<any>{field: String })})
    let object    = {set: {field: '1234'} }
    let err       = schema.validateOf(object, true);
        ifError(err)
        console.log('nested schemas ok');
}
{
  
    Promise.all([
      new Rules({ foo: String }).validateOf({ foo: 'ok' }),
      new Rules({ foo: String }).validateOf({ foo: new Error() }).catch(err => err)
    ])
    .then(function ([,err]){
      ok(err instanceof Error);
      console.log('promised validate() ok');
    },err => console.log(err))
}
(async function(){
  try {
    let d = await new Stigma({value: Boolean}).validate({value: true});
    d.value && console.log('promised validate() promise ok')
  } catch (error) {
    throw error
  }
})();
console.log('tests.js: ended');
