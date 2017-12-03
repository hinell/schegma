import {Rules, SchemaMixed, isNumber, Rule} from './stigma';

// TODO: Adopt better testing framework
console.log('tests.js:');
{
    const schema: SchemaMixed<any> = {
          name      : String
        , outdated  : Boolean
        , phone     : Number
        , desc      : ['optional',String]
        , itemsID   : [Array,function (this: Rule, value, rule){
          return value.every(isNumber) || `{ ${this.ruleJSON}: array of numbers is expected! }`
        }]
        , message   : String
        , test      : /^\d\d\d-\d\d\d$/g
        , sonne     : 'required'
    };
    const target = {
          name      : 'Father of god'
        , phone     : 9998887766
        , outdated  : true
        , desc      : void 0 // missing - validate() has to return no errors here
        , itemsID   : [1,3,4,5]
        , message   : 'Secret message here...'
        , test      : '333-444'
        , sonne     : 'ok, it is here'
        };
    new Rules(schema).validate(target, true);
    console.log('stigma: base schema ok')
}
{
    const schema = new Rules({foo: {bar: String} });
    [true, 999, {}, new RegExp('.*')].forEach(function (el) {
      let thrown = false;
      try {
        schema.validate({foo: {7: el}},true)
      } catch (e) {
        thrown = true;
        console.log(`stigma: nested rule ${JSON.stringify(el)} ok`);
      }
      if(!thrown) { throw new Error('stigma: icompatible rules should fail!') }
      
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
    new Rules(schema).validate(obj,true);
    console.log(`stigma: constructors rule ${schema.foo.name} ok`);
  })
  console.log('stigma: constructors rules ok');
}
{
    // there is well-known bug with nested types of stigma schemas instances
    // like this one below where nested new Stigma({field: ... }) schema is
    // asserted by the <any> assertion to make sure typescript passes type check
    
    const schema = new Rules({ne: {es: {ted: String } }})
    const object    = {ne: {es: {ted: 'text' } }};
          schema.validate(object, true);
          console.log('stigma: nested schema ok');
}
{
  const schema = { foo: String };
  const object = { foo: 'string is here'};
  const retrn  = new Rules(schema).validate(object, true)
  if(retrn !== object) {
    throw new Error('stigma: validate() should return target object')
  }
  console.log('stigma: validate() returns target');
  
}

(async function(){
  try {
    const promise = new Rules({value: Boolean}).validate({value: true});
    if(!(promise instanceof Promise)){ throw new Error('Promise is expected!') }
    const d = await promise;
    if(d.value){ console.log('stigma: promised validate() promise ok') };
  } catch (error) {
    throw error
  }
})();

// Rule test
{
  const errorCb = new Error('error returned from callback');
  try {
    new Rule(v => errorCb).validate(0, true);
    //throw new Error(`The errorCb  should be thrown`);
  } catch (error) {
    if(errorCb !== error) { throw new Error('rule custom function return should be equal') }
  }
  
  console.log('stigma: errorCb ok');
  
}
{
   [
      [Number, 123]
    , [String,'123']
    , [Boolean,!0]
    , [Date, new Date()]
    , [Array,[]]
  ].forEach(<any>(([rule,value]) => {
    new Rule(rule,'').validate(value,true,value);
    console.log(`rule: constructor ${rule.name} ok`);
  }))
  console.log('rule constructors ok');
  
}
{
  let rule;
  const callback = function (value, rule_) {return (rule_ === rule && rule === this) || 'Rule expected!'};
        rule = new Rule(callback);
  try {
    rule.validate('value', true);
  } catch (e) {
    throw new Error('this & rule inside the callback should be the same as the rule variable')
  }
  console.log('rule: rule parameter & this inside function rule ok');
}
{
  const propertyName  = 'prop';
  const propertyName2 = 'prop2';
  const callback = function (){
    const p1ok = this.prop === propertyName;
    const p2ok = this.prop === propertyName2;
    if(this.rule !== callback){
      return new Error('this.rule should be equal to the callback')
    }
    const missingProperty = new Error(`this.prop should contain '%s' property`);

    if(p1ok || p2ok) { return }
    if(!p1ok) {missingProperty.message = missingProperty.message.replace('%s',propertyName) ; return missingProperty}
    if(!p2ok) {missingProperty.message = missingProperty.message.replace('%s',propertyName2); return missingProperty}
    
  };
  try {
    const rules = new Rules({
        [propertyName]: ['required',callback]
      , [propertyName2]: ['optional',callback]
    });
    rules.validate({[propertyName]: 1, [propertyName2]: 1}, true)
  } catch (error) {
    throw error
  }
  
  console.log('rule: this.prop and this.rule setting is ok');
}
console.log('test.js are successful');
