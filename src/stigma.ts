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
    | FunctionConstructor
    | NumberConstructor
    | StringConstructor
    | BooleanConstructor
    | ArrayConstructor
    | DateConstructor
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
Rule: RuleCon<any> = <any> function (rule,prop) {
    if (!rule) { throw new Error('Invalid rule: function, string, regExp or Rule instance is expected!')}
    if (rule instanceof Rule) {return rule}
    this.rule  = rule;
    this.prop  = prop;
}
Rule.prototype.validateOf = function (value,target) {
    if (!target) {throw new Error('Invalid argument: target object is required!')}
    this.val = value;
    let checkOutVal = function (conresultOfCodition,message){
        if(conresultOfCodition == true) {
            return   new Error(`Invalid object type: { ${this.prop} : must be of ${message} type } `)
        }
    }.bind(this)
    if (isFunction(this.rule)   ) {
        switch (this.rule) {
            case Boolean  : return checkOutVal(!isBoolean  (this.val),'boolean' );
            case Number   : return checkOutVal(!isNumber   (this.val),'number'  );
            case String   : return checkOutVal(!isString   (this.val),'string'  );
            case Date     : return checkOutVal(!isDate     (this.val),'date'    );
            case Array    : return checkOutVal(!isArray    (this.val),'array'   );
            default       : return this.rule.call(target,this.val,this.prop)
        }
    }
    if (isRegExp(this.rule)     ) { return this.rule.test(this.val) ? void 0 : '{\''+this.prop+'\': \''+this.val+'\'}\r\nfailed against '+this.rule; }
    if (isString(this.rule)     ) {
    let warn = 'WARNING!: String rules are now deprecated!\r\nUse built-in constructors, like Number, Boolean and Date etc. instead.'
        console.log(warn);
        console.log(new Error().stack.slice(10));
        switch (this.rule) {
            case 'boolean'  : return checkOutVal(!isBoolean  (this.val),'boolean' );
            case 'number'   : return checkOutVal(!isNumber   (this.val),'number'  );
            case 'string'   : return checkOutVal(!isString   (this.val),'string'  );
            case 'date'     : return checkOutVal(!isDate     (this.val),'date'    );
            case 'array'    : return checkOutVal(!isArray    (this.val),'array'   );
        }
    }
    return `Error: Invalid rule!:  { '${this.prop}' :  ${this.rule} } `
}

export const isBoolean  = function (v) { return typeof v === 'boolean'              };
export const isNumber   = function (v) { return typeof v === 'number'               };
export const isString   = function (v) { return typeof v === 'string'  && v.length  };
export const isDate     = function (v) { return v instanceof Date                   };
export const isArray    = function (v) { return v instanceof Array                  };
export const isFunction = function (v) { return v instanceof Function               };
export const isRegExp   = function (v) { return v instanceof RegExp                 };

export interface SchemaIns<TargetT> {
    validateOf(target: TargetT & object): Promise<TargetT>
    validateOf(target: TargetT & object, sync: true ): ValidationError
}

export type Descriptor  <TargetT> = RuleT<TargetT> | SchemaIns<TargetT>;
export type SchemaSingle<TargetT> = { [K in keyof TargetT] : Descriptor<TargetT>   }
export type SchemaArray <TargetT> = { [K in keyof TargetT] : Descriptor<TargetT>[] }
export type SchemaMixed <TargetT> = { [K in keyof TargetT] : Descriptor<TargetT> | Descriptor<TargetT>[] }
export type Schema<TargetT> = SchemaSingle<TargetT> | SchemaArray <TargetT> | SchemaMixed<TargetT>;
export interface SchemaCon {
    new <TargetT>(schema: Schema<TargetT>, excessPropertyCheck?: boolean): SchemaIns<TargetT>
        <TargetT>(schema: Schema<TargetT>, excessPropertyCheck?: boolean): SchemaIns<TargetT>
}

// @param {object}  - Object with description of his types
// @param {boolean} - If true then doesn't check excessive properties
export const
Stigma: SchemaCon            = function (schemaDescriptor,excessiveProps = true) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
    Object.defineProperties(this,{
          'excessiveProps' : {configurable: true, writable: true, enumerable: false, value: excessiveProps}
        , 'schema_'        : {configurable: true, writable: true, enumerable: false, value: schemaDescriptor}
      }
    )

} as any;

Stigma.prototype.constructor = Stigma;

let stigmaValidate = function (target,sync) {
    if(isString(target)) { return new Error('validateOf() - Invalid argument: object is expected') }
    let skeys       = Object.keys(this.schema_);    // keys of schema object provided by new constructor(schema)
    let tkeys       = Object.keys(target);          // keys of target object provided by validateOf(target)
    if (!skeys.length) { return new Error('Invalid schema: schema object requires at least one prop')          }
    if (!tkeys.length) { return new Error('validateOf() - Invalid argument: [ '+skeys+' ] properties are required') }
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
        let err = [
            'Invalid target object: all these properties are excessive\r\n> '
            ,excessprops.join('\r\n> ')+'\r\n'
            ,'\r\n\r\nTry to use excessiveProps option in the new Stigma constructor to bypass this error.'].join('');
            return new Error(err)
        }
    }

    for (let schemakey of skeys) {
        let rule    = this.schema_[schemakey];
        let value   = target[schemakey];
        let err;
        
        //  Speeding up rule checking
        //  Rule is INSTANCE of Stigma
        if (rule instanceof Stigma) {
            if (value == void 0) { return new Error('{ '+schemakey+' : is required! }') }
            if (err = rule.validateOf(value,sync)       ) { return err};
            continue
        }
        //  Rule is INSTANCE of Rule
        if (rule instanceof Rule)   {
            if (value == void 0) { return new Error('{ '+schemakey+' : is required! }') }
            if (err = rule.validateOf(value,target)   ) { return err};
            continue
        }
            Array.isArray(rule) || (rule = [rule]);
        for (let current of rule) {
            if(current == 'required') {
                // if no value, then return error message
                if(value == void 0){ return new Error(`{ ${schemakey} : is required! }`)}
                else { continue } // iterate over to the next rule
            }
            if(current == 'optional') {
                if(value == void 0) { break } // if no value present then break
                else { continue }             // else continue to next rule
            }
            if(err = new Rule(current,schemakey).validateOf(value,target) ){return err} }

    }
}

// @param {object} - object to compare schema against
// @callback - optional
export const TARGET_IS_MISSING = new Error('Stigma validator: Invalid argument: target is missing!');
Stigma.prototype.validateOf = function (target,sync) {
    if(target === undefined){ throw TARGET_IS_MISSING  }
    let err = stigmaValidate.call(this,target,sync);
    if(sync){ return err }
    return err === undefined ? Promise.resolve(target) : Promise.reject(err)
};
