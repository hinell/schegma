import {Rules, SchemaMixed, isNumber, Rule} from './stigma';
import { ok} from 'assert';
// TODO: Adopt better testing framework
console.log('tests.js:');
{
    const schema: SchemaMixed<any> = {
          name      : String
        , outdated  : Boolean
        , phone     : Number
        , desc      : ['optional',String]
        , itemsID   : [Array,function (this: Rule, value, rule){
          return value.every(isNumber) || '{ '+this.ruleJSON+': array of numbers is expected! }'
        }]
        , message   : String
        , test      : /^\d\d\d-\d\d\d$/g
        , sonne     : 'required'
    };
    const target = {
          name      : 'Father of god'
        , phone     : 9998887766
        , outdated  : true
        , desc      : void 0 // missing - validateOf() has to return no errors here
        , itemsID   : [1,3,4,5]
        , message   : 'Secret message here...'
        , test      : '333-444'
        , sonne     : 'ok, it is here'
        };
    const err: any = new Rules(schema).validateOf(target, true);
    if (err) {throw err}
    console.log('stigma: base schema ok')
}
{
    const schema = new Rules({foo: {bar: String} });
    [true, 999, {}, new RegExp('.*')].forEach(function (el) {
        const err: any = schema.validateOf({foo: {7: el}}, true)
        if(!err){ throw new Error('This test should return error') }
        console.log(`stigma: nested rule ${JSON.stringify(el)} ok`)
    });
    console.log('stigma: nested failed rules test ok');
}
{
  const testingSet = [
      [{foo: Boolean}, {foo: true }]
    , [{foo: Number }, {foo: 1234 }]
    , [{foo: String }, {foo: 'abcd' }]
    , [{foo: Date   }, {foo: new Date }]
    , [{foo: Array  }, {foo: [] }]
  ];
  
  testingSet.forEach((pair: any) => {
    const [schema, obj] = pair;
    console.log(`stigma: constructors rule ${schema.foo.name} ok`)
    const err = new Rules(schema).validate(obj,true)
    if(err){ throw err }
  })
  console.log('stigma: constructors rules ok');
}
{
    // there is well-known bug with nested types of stigma schemas instances
    // like this one below where nested new Stigma({field: ... }) schema is
    // asserted by the <any> assertion to make sure typescript passes type check
    
    const schema = new Rules({ne: {es: {ted: String } }})
    const object    = {ne: {es: {ted: 'text' } }};
    const err       = schema.validateOf(object, true);
        if(err){ throw err }
        console.log('stigma: nested schema ok');
}
{
    Promise.all([
      new Rules({ foo: String }).validateOf({ foo: 'ok' }),
      new Rules({ foo: String }).validateOf({ foo: new Error() }).catch(err => err)
    ])
    .then(function ([,err]){
      ok(err instanceof Error);
      console.log('stigma: promised all validate() ok');
    },err => console.log(err))
}

(async function(){
  try {
    const d = await new Rules({value: Boolean}).validate({value: true});
    if(d.value){ console.log('stigma: promised validate() promise ok') };
  } catch (error) {
    throw error
  }
})();
{
  const errorString = 'ErrorString';
  const error = new Rule(v => errorString).validate(0, true);
  
  if(Rule.INVALID_VALUE !== error) { throw new Error('Stigma custom function should return be equal') }
  console.log('stigma: errorString ok');
  
}

// Rule test
{
   [
      [Number, 123]
    , [String,'123']
    , [Boolean,!0]
    , [Date, new Date()]
    , [Array,[]]
  ].forEach(<any>(([rule,value]) => {
    const err = new Rule(rule,'').validate(value,true,value);
    if(err){ throw err }
      console.log(`rule: constructor ${rule.name} ok`);
  }))
  console.log('rule constructors ok');
  
}
{
  const rule = new Rule(function (value,rule_) {
    return (value === 'value' && rule_ === rule && rule === this) || 'Rule expected!'
  });
  const err = rule.validate('value',true);
  if (err) {throw new Error('this & rule should be the same as the rule variable');}
  console.log('rule: rule parameter & this inside function rule ok');
}
