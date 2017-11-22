﻿/*
MIT License

Copyright (c) 2017 By Alexander Davronov (Aristov)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

export type ValidationError = Error | string | void;
// Here we have an interesting bug with literals
// see more here: https://github.com/Microsoft/TypeScript/pull/10676#issuecomment-244255103
export type RuleObj =
  {(this: Rule, val: any, rule: Rule): ValidationError | boolean }
  | 'required'
  | 'optional'
  | 'string'
  | 'array'
  | 'number'
  | 'boolean'
  | 'date'
  | Function
  | FunctionConstructor
  | NumberConstructor
  | StringConstructor
  | BooleanConstructor
  | ArrayConstructor
  | DateConstructor
  | Rule | RegExp

export type Descriptor  <TargetT> = RuleObj | Rules<TargetT>;
export type SchemaSingle<TargetT> = { [K in keyof TargetT] : Descriptor<TargetT>   }
export type SchemaArray <TargetT> = { [K in keyof TargetT] : Descriptor<TargetT>[] }
export type SchemaMixed <TargetT> = { [K in keyof TargetT] : Descriptor<TargetT> | Descriptor<TargetT>[] }
export type Schema<TargetT> = object & (SchemaSingle<TargetT> | SchemaArray <TargetT> | SchemaMixed<TargetT>);

export const isBoolean  = function (v) { return typeof v === 'boolean'  };
export const isNumber   = function (v) { return typeof v === 'number'   };
export const isString   = function (v) { return typeof v === 'string'  && !!v.length  };
export const isDate     = function (v) { return v instanceof Date       };
export const isArray    = function (v) { return v instanceof Array      };
export const isFunction = function (v) { return v instanceof Function   };
export const isRegExp   = function (v) { return v instanceof RegExp     };
export const isObject   = function (v) { return v && v.constructor === Object.prototype.constructor};
export const min        = function (n = 1) {
  return function (v){
    let err, l;
    if(isNumber(v)){
      err = `The number is below or equal to the limit set to ${n}`;
      l = v;
    } else {
      err = `At least ${n} characters are required`;
      l = v.length
    }
    if(l < n){ return new Error(err) }
  }
}
export const max        = function (n = 1) {
  return function (v){
    let err, l;
    if(isNumber(v)){
      err = `The number is above or equal to the limit set to ${n}`;
      l = v;
    } else {
      err = `No more than ${n} characters are expected`;
      l = v.length
    }
    if(l > n){ return new Error(err) }
  }
}


export class Rule {
  static INVALID_RULE   = new TypeError('Invalid argument: function, string, regExp or Rule instance is expected!');
  static INVALID_VALUE  = new Error('Invalid value:\n\tvalue of the "%s"\n\tis expected to be a "%s1"');
  
  rule: any;
  ruleJSON: string;
  prop: string;
  constructor(rule: RuleObj, prop = '') {
    if (!rule) { throw Rule.INVALID_RULE }
    if (rule instanceof Rule) {return rule}
    this.rule     = rule;
    this.ruleJSON = JSON.stringify(rule, void 0,'\t') || this.rule.name;
    this.prop     = prop;
  }
  
  targetObj: any;
  value: any;
  
  validateOf(value,sync?): ValidationError { return this.validate.apply(this,arguments)  }
  validate(value,sync,targetObj?,verbose?): ValidationError  {
    this.value      = value;
    this.targetObj  = targetObj;
    if (isFunction(this.rule)) {
        let error;
        switch (this.rule) {
            case Boolean  : error = isBoolean(value); break;
            case Number   : error = isNumber (value); break;
            case String   : error = isString (value); break;
            case Date     : error = isDate   (value); break;
            case Array    : error = isArray  (value); break;
            // TODO: Pass targetObject argument to the callback
            default       : error = this.rule.call(this,this.value,this)
        }
        
        if (error instanceof Error){
          return error
        } else if(isString(error) || (isBoolean(error) && !error)){
        const err: any = Rule.INVALID_VALUE;
            err.message = err.message
              .replace('%s', this.prop)
              .replace('%s1', this.ruleJSON || this.rule.name)
            if (targetObj) {
              err.message += '\n' + this.ruleJSON.substr(0, 256) + '\n'; }
              return err
        }
        return
    }
    if (isRegExp(this.rule)) {
      if (!this.rule.test(this.value)) {
        return `RegExp validation failed: \n ${
          targetObj
            ? JSON.stringify(targetObj, void 0,'\t')
            : `${this.prop} : ${ this.value}`
          } \n ${this.ruleJSON}`;
      }
      return
    }
    throw new Error(`Unrecognized rule type:
    property name: '${this.prop}'
    rule :  ${this.ruleJSON}
    value: '${this.value}'
    `)
  }
}

export class Rules<Obj> {
  static INVALID_SCHEMA = new Error('Invalid schema: schema object requires at least one prop')
  keys: Array<string>;
  rules: object  = {};
  constructor(
      public schema: Schema<Obj>
    , public redundantProps: boolean = true){
    this.redundantProps = redundantProps;
    this.keys = Object.keys(this.schema).filter(k => {
      if(!this.schema[k]){ delete this.schema[k]; return }
      return true
    });
    if(!this.keys.length){ throw Rules.INVALID_SCHEMA }
    // constructing schema object
    for (let i = 0; i < this.keys.length; i++) {
      const key         = this.keys[i];
      const rule        = this.schema[key];
      const values      = isArray(rule) ? rule : [rule];
      this.rules[key] = values.map((rule) =>{
        if(rule instanceof Rules || rule instanceof Rule){ return rule }
        if(rule === 'required' || rule === 'optional') { return rule }
        return isObject(rule) ? new Rules(rule,redundantProps) :  new Rule(rule,key)
        
      })
    }
  }
  
  validateOf<T>(target: T, sync : true , verbose?: boolean): ValidationError
  validateOf<T>(target: T, sync?: false, verbose?: boolean): Promise<T>
  validateOf(target,sync?){ return this.validate.apply(this,arguments) }
  
  targetKeys: Array<string>
  target: object;
  static OBJECT_IS_MISSING           = new Error('Invalid argument: object is missing');
  static INVALID_OBJ_REDUNDANT_PROPS = new Error('Invalid argument: redundant properties:');
  static VALIDATION_PROP_REQUIRED    = new Error('Invalid argument: the %s property is missing in');
  
  validate<T>(target: T & object, sync : true , verbose?: boolean): ValidationError
  validate<T>(target: T & object, sync?: false, verbose?: boolean): Promise<T>
  
  validate(targetObj, sync, verbose?) {
    if(!isObject(targetObj)) { return Rules.OBJECT_IS_MISSING }
    this.target = targetObj;
    
    const skeys = this.keys;
    const tkeys = this.targetKeys = Object.keys(targetObj); // keys of targetObj object provided by validateOf(targetObj)
    if (!skeys.length) {return Rules.INVALID_SCHEMA}
    if (!tkeys.length) {return Rules.OBJECT_IS_MISSING}
    if (this.redundantProps) {
      const excessive = [];
      main: for (let i = 0; i < tkeys.length; i++) {
        const targetKey = tkeys[i];
        for (let j = 0; j < skeys.length; j++) {
          const schemaKey = skeys[j];
          if(targetKey === schemaKey){ continue main }
        }
        if(!excessive.includes(targetKey)) {
          excessive.push(targetKey)
        }
      }
      if (excessive.length) {
      const err: any = Rules.INVALID_OBJ_REDUNDANT_PROPS;
          if(verbose){
              err.message += [
               '\n'
              ,'> '+excessive.join('\r\n> ')
              ,'\n' + JSON.stringify(targetObj,void 0,'\t').substr(0, 256)
              ,'\n\nTry to use excessiveProps option in the new Stigma constructor to bypass this error.'].join('');
          }
        
          return Rules.INVALID_OBJ_REDUNDANT_PROPS
      }
    }
  
    for (let i = 0; i < this.keys.length; i++) {
      const key   = this.keys[i];
      const rule  = this.rules[key];
      const value = this.target[key];
      const rules = Array.isArray(rule) ? rule : [rule];
      for (let j = 0; j < rules.length; j++) {
        const rule = rules[j];
        if(rule === 'required') {
          if (value) {continue}
          const err: any = Rules.VALIDATION_PROP_REQUIRED
          if(verbose){ err.message = err.message.replace('%s',key) };
          return sync ? err : Promise.reject(err);
        }
        
        if(rule === 'optional') {
          // if no value present then continue
          if(value) { continue }
          break
        }
        const err = rule.validate(value, sync, targetObj, verbose);
        if(isString(err) || err instanceof Error){
          if(sync){ return err }
          return Promise.reject(err)
        }
      }
    }
    if(!sync){ return Promise.resolve(targetObj) }
  }

}

