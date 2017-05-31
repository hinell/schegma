﻿export type ValidationError = Error | string | void;
// Here we have an interesting bug with literals
// see more here: https://github.com/Microsoft/TypeScript/pull/10676#issuecomment-244255103
export type RuleT<TargetT> =
    {(this: TargetT, val:any, prop: string): ValidationError}
    | 'required'
    | 'optional'
    | 'array'
    | 'number'
    | 'string'
    | 'boolean'
    | 'date'
    | 'function'
    | RuleIns | RegExp

export interface RuleIns {validateOf: (value: any, targetObj: object) => ValidationError }
// TODO: Simplify constructor. Remove property
export interface RuleCon<TargetT> {
    new (rule: RuleT<TargetT>, property?: string): RuleIns
        (rule: RuleT<TargetT>, property?: string): RuleIns
}
// @param {RegExp|function|Rule| Array<any>} Test - Test object
// @param {string} Property name
export const
Rule: RuleCon<any> = function (rule,prop) {
    if (!rule) { throw new Error('Invalid rule: function, string, regExp or Rule instance is expected!')}
    if (rule instanceof Rule) {return rule}
    this.rule  = rule;
    this.prop  = prop;
} as any
Rule.prototype.validateOf = function (value,target) {
    if (!target) {throw new Error('Invalid argument: target object is required!')}
    this.val = value;
    let errorMessage = function (msg,prop){
        return prop
            ? `Invalid object: { ${prop} : must be of ${msg} type } `
            : `Invalid object: { }`
    }
    if (isFunction(this.rule)   ) { return this.rule.call(target,this.val,this.prop) }
    if (isRegExp(this.rule)     ) { return this.rule.test(this.val) ? void 0 : '{\''+this.prop+'\': \''+this.val+'\'}\r\nfailed against '+this.rule; }
    if (isString(this.rule)     ) {
        switch (this.rule) {
            case 'boolean'  : if(!isBoolean  (this.val)) {return errorMessage('boolean' , this.prop) } return;
            case 'number'   : if(!isNumber   (this.val)) {return errorMessage('number'  , this.prop) } return;
            case 'string'   : if(!isString   (this.val)) {return errorMessage('string'  , this.prop) } return;
            case 'date'     : if(!isDate     (this.val)) {return errorMessage('date'    , this.prop) } return;
            case 'array'    : if(!isArray    (this.val)) {return errorMessage('array'   , this.prop) } return;
            case 'function' : if(!isFunction (this.val)) {return errorMessage('function', this.prop) } return;
        }
    }
    return `Error: { '${this.prop}' : Invalid rule! ${this.rule} }`
}

export const isBoolean  = function (v) { return typeof v === 'boolean'              };
export const isNumber   = function (v) { return typeof v === 'number'               };
export const isString   = function (v) { return typeof v === 'string'  && v.length  };
export const isDate     = function (v) { return v instanceof Date                   };
export const isArray    = function (v) { return v instanceof Array                  };
export const isFunction = function (v) { return v instanceof Function               };
export const isRegExp   = function (v) { return v instanceof RegExp                 };

export interface SchemaIns<TargetT> {
    validateOf(target: TargetT & object): ValidationError
    validateOf(target: TargetT & object,cb: (err: ValidationError) => void ): void
}

export type Descriptor<TargetT> = RuleT<TargetT> | SchemaIns<TargetT>;
export interface SchemaSingle<TargetT> { [key: string] : Descriptor<TargetT>   }
export interface SchemaArray <TargetT> { [key: string] : Descriptor<TargetT>[] }
export interface SchemaMixed <TargetT> { [key: string] : Descriptor<TargetT> | Descriptor<TargetT>[] }

export interface SchemaCon {
    new <TargetT = any>(obj: SchemaSingle<TargetT> | SchemaArray<TargetT> | SchemaMixed<TargetT>, excessPropertyCheck?: boolean): SchemaIns<TargetT>
        <TargetT = any>(obj: SchemaSingle<TargetT> | SchemaArray<TargetT> | SchemaMixed<TargetT>, excessPropertyCheck?: boolean): SchemaIns<TargetT>
}

// @param {object}  - Object with description of his types
// @param {boolean} - If true then doesn't check excessive properties
export const
Stigma: SchemaCon = function (schemaDescriptor,excessiveProps = true) {
    this.excessiveProps = excessiveProps;   // true by default
    this.schema_        = schemaDescriptor;
} as any;
Stigma.prototype.constructor = Stigma
Stigma.prototype._validateOf = function (target) {
    if(isString(target)) { return 'validateOf() - Invalid argument: object is expected' }
    let skeys       = Object.keys(this.schema_);    // keys of schema object provided by new constructor(schema)
    let tkeys       = Object.keys(target);          // keys of target object provided by validateOf(target)
    if (!skeys.length) { return 'Invalid schema: schema object requires at least one prop'          }
    if (!tkeys.length) { return 'validateOf() - Invalid argument: [ '+skeys+' ] properties are required' }
    if (this.excessiveProps) {
        let excessprops = [];
        toploop:
        for (let targetkey of tkeys) {
        for (let schemakey of skeys) {
            if(targetkey === schemakey) {continue toploop}
        }
            excessprops.includes(targetkey) || (excessprops.push(targetkey))
        }
        if (excessprops.length) {
            return 'Invalid target object: all these properties are excessive\r\n> '+excessprops.join('\r\n> ')+'\r\n'
                +'\r\n\r\nTry to use excessiveProps option in the new Stigma constructor to bypass this error.'
        }
    }

    for (let schemakey of skeys) {
        let rule    = this.schema_[schemakey];
        let value   = target[schemakey];
        let err;
        
        //  Speeding up rule checking
        //  Rule is INSTANCE of Stigma
        if (rule instanceof Stigma) {
            if (value == void 0) { return '{ '+schemakey+' : is required! }' }
            if (err = rule.validateOf(value)          ) { return err};
            continue
        }
        //  Rule is INSTANCE of Rule
        if (rule instanceof Rule)   {
            if (value == void 0) { return '{ '+schemakey+' : is required! }' }
            if (err = rule.validateOf(value,target)   ) { return err};
            continue
        }
            Array.isArray(rule) || (rule = [rule]);
        for (let current of rule) {
            if(current == 'required' && !value) { return '{ '+schemakey+' : is required! }' }
            if(current == 'optional') {
                if(value == void 0 || value == '') { break } // if no value present then break
                else { continue }                            // else continue to next rule
            }
            if(err = new Rule(current,schemakey).validateOf(value,target) ){return err} }

    }
};

// @param {object} - object to compare schema against
// @callback - optional
Stigma.prototype.validateOf = function (target,cb) {
    let err = this._validateOf(target);
    if (cb) { err ? cb(err) : cb() } else {return err }
};