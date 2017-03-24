export type ValidationError = Error | string | void;
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
export const Rule: RuleCon<any> = function (rule,prop) {
    if (!rule) { throw new Error('Invalid rule: function, string, regExp or Rule instance is expected!')}
    if (rule instanceof Rule) {return rule}
    this.rule  = rule;
    this.prop  = prop;
} as any
Rule.prototype.validateOf = function (value,target) {
    if (!target) {throw new Error('Invalid argument: target object is required!')}
    this.val = value;
    if (this.rule.apply && this.rule.call   ) { return this.rule.call(target,this.val,this.prop) }
    if (this.rule.exec  && this.rule.test   ) { return this.rule.test(this.val) ? void 0 : '{\''+this.prop+'\': \''+this.val+'\'}\r\nfailed against '+this.rule; }
    if (this.rule.match && this.rule.substr ) {
        // TODO: Refine this error output
        this.err   = '{ \''+this.prop+'\': ';
        switch (this.rule) {
            case 'boolean'  : if(!isBoolean  (this.val)) {return this.err+=' must have a boolean '+'}' } return
            case 'number'   : if(!isNumber   (this.val)) {return this.err+=' must have a number  '+'}' } return
            case 'string'   : if(!isString   (this.val)) {return this.err+=' must have a string  '+'}' } return
            case 'date'     : if(!isDate     (this.val)) {return this.err+=' must have a date    '+'}' } return
            case 'array'    : if(!isArray    (this.val)) {return this.err+=' must have a array   '+'}' } return
            case 'function' : if(!isFunction (this.val)) {return this.err+=' must have a function'+'}' } return
        }
        return
    }
    return `Error: { '${this.prop}' : Invalid rule! }`
}

export const isBoolean  = function (v) { return typeof v === 'boolean' };
export const isNumber   = function (v) { return typeof v === 'number' };
export const isString   = function (v) { return typeof v === 'string'  && v.length };
export const isDate     = function (v) { return !!(v && v.setSeconds   && v.setMinutes && v.setHours  && v.toDateString )};
export const isArray    = function (v) { return !!(v && v.pop          && v.shift      && v.slice     && v.map )};
export const isFunction = function (v) { return !!(v && v.bind         && v.call       && v.apply     && v.prototype )};
export const isRegExp   = function (v) { return !!(v && v.exec         && v.test       && isBoolean(v.global)) };

export interface SchemaIns {
    validateOf(target: {}): ValidationError
    validateOf(target: {},cb: (err: ValidationError) => void ): void
}

export type Descriptor<TargetT> = RuleT<TargetT> | SchemaIns;
export interface SchemaSingle<TargetT> { [key: string] : Descriptor<TargetT>   }
export interface SchemaArray <TargetT> { [key: string] : Descriptor<TargetT>[] }
export interface SchemaMixed <TargetT> { [key: string] : Descriptor<TargetT> | Descriptor<TargetT>[] }

export interface SchemaCon {
    new <TargetT>(obj: SchemaSingle<TargetT> | SchemaArray<TargetT> | SchemaMixed<TargetT>, excessPropertyCheck?: boolean): SchemaIns
        <TargetT>(obj: SchemaSingle<TargetT> | SchemaArray<TargetT> | SchemaMixed<TargetT>, excessPropertyCheck?: boolean): SchemaIns
}

// Usage:
// errmsg = 'Has to be string'
// test   = [function(val){ return typeof val === 'string'}] // or just function
// schema = new Schema({foo: {test: test , err: errmsg}})
// schema.validateOf({foo: 1}, function(err){ console.log(err == errmsg) })
// @param {object}  - Object with description of his types
// @param {boolean} - If true then doesn't check excessive properties
export const Schema: SchemaCon = function (schemaDescriptor,excessiveProps = true) {
    this.excessiveProps = excessiveProps;   // true by default
    this.schema_        = schemaDescriptor;
} as any;
Schema.prototype._validateOf = function (target) {
    if(isString(target)) { return 'validateOf() - Invalid argument: object is expected' }
    let skeys       = Object.keys(this.schema_);    // keys of schema provided by new constructor()
    let tkeys       = Object.keys(target);          // keys of target provided by validateOf()
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
                +'\r\n\r\nTry to use excessiveProps option in the new Schema constructor to bypass this error.'
        }
    }

    for (let k of skeys) {
    let rule    = this.schema_[k];
    let value   = target[k];
    if (rule instanceof Schema) { let err; if (err = rule.validateOf(value) ) { return err}       continue }
    if (rule instanceof Rule)   { let err; if (err = rule.validateOf(value,target)) { return err} continue }
        Array.isArray(rule) || (rule = [rule]);
    let err;
    for (let current of rule) {
        if(current == 'required' && !value) { return '{ '+k+' : is required! }' }
        if(current == 'optional' && !value) { break }
        if(err = new Rule(current,k).validateOf(value,target) ){return err} }

    }
};

// @param {object} - object to compare schema against
// @callback - optional
Schema.prototype.validateOf = function (target,cb) {
    let err = this._validateOf(target);
    if (cb) { err ? cb(err) : cb() } else {return err }
};
