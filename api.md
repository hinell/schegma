# Interface reference (API)
[d]: #interface-reference-api
**[PROJECT PAGE](../../) | [README](README.md) | [EXAMPLES][exmp]**

### Short list of all exports
**[`class Rules(...)`][st]**
- **[`.validate(...)`][stval]**
- Errors that are _returned_ by validate():
- **[`Rules.OBJECT_IS_MISSING`][ruleserrs]**
- **[`Rules.INVALID_OBJ_REDUNDANT_PROPS`][ruleserrs]**
- **[`Rules.VALIDATION_PROP_REQUIRED`][ruleserrs]**

**[`class Rule`][rule]** - Rule wrapper
- **[`Rule.INVALID_RULE`][ruleerrors]**
- **[`Rule.INVALID_VALUE`][ruleerrors]**
- **[`Rule.INVALID_REGEXP`][ruleerrors]**

Schema helpers
<br>**[`min(n)`][helpers]**
<br>**[`max(n)`][helpers]**
<br>**`isBoolean(value): boolean`**
<br>**`isNumber(value): boolean`**
<br>**`isString(value): boolean`**
<br>**`isDate(value): boolean`**
<br>**`isArray(value): boolean`**
<br>**`isFunction(value): boolean`**
<br>**`isRegExp(value): boolean`**
<br>**`isObject(value): boolean`**


<hr>

### `class Rules`
[st]: #class-rules
```typescript
new Rules(schema: schema, redundantProps: boolean = true)
``` 
Instantiates validation object.
```typescript
schema: { field : Rule | Array<Rule>} // field is simple object property
Rule: 
    Number | String | Boolean | Array | Date
  | RegExp 
  | 'optional' // denotes optional field of the schema
  | 'required'
  | function (fieldValue): Error | String
```

The `schema` is a normal js object which contains
<br>constructors names like `String` as validating rules (`rule` for the rest of document)
<br>Every such `rule` is matched against built-in validators, for example for `Boolean`
<br>constructor there `isBoolean(...)` function will be used (see exports above).

You can create your own `rule` by providing simple function.
<br>Such function are restricted to return `string` and `error` types only.
<br>If string is returned then **[`Rule.INVALID_RULE`][ruleerrors]** is thrown by `.validate(...)`
<br>The rules by itself can be combined into arrays. See examples [below][exmp].

The ``'optional'`` rule allows validation pass free (without errors) if
<br>respective field's value is missing
<br>meanwhile ``'required'`` will throw **[`Rules.VALIDATION_PROP_REQUIRED`][ruleserrs]** error. 

#### `.validate(...)`
[stval]: #validate

```typescript 
validate(target: object, synchronous: boolean = false, verbose: boolean): Promise<target> // default
validate(target: object, synchronous: boolean = true , verbose: boolean): target // throws error
```
Validation function of the stigma object.
<br> **`target`** - simple js object to be validated.
<br> **`synchronous`** - configure if promise will be returned or target object itself simple error/string.

Synchronous api:
```typescript
  new Rules({foo: 'optional', bar: 'required'})
    .validate({
      foo: null,// no errors
      bar: null // error
    },true)
```

Promise-based api is also available (asynchronous api):
```typescript
new Rules(...).validate(dataStructure)
  .then(dataStructure => ...)
  .catch(error => /* do something with error * )
```
You can also use **async/await**:
```typescript
const targetObject = await ....validate(targetObject,...); 
```


#### `Rules` static errors
[ruleserrs]: #rules-static-errors

Whenever the error occurs the method throws the following errors:
<br>**``Rules.OBJECT_IS_MISSING``** - when first argument is missing
<br>**``Rules.INVALID_OBJ_REDUNDANT_PROPS``** - when there are redundunt (regarding those in schema) fileds in the provided object
<br>**``Rules.VALIDATION_PROP_REQUIRED``** - when value is ``'required'`` by the schema but missing in provided object


### `class Rule`
[rule]: #class-rule

```typescript
new Rule(rule,name)
```
The rule wrapper. 

#### `Rule` static errors
[ruleerrors]: #rule-static-errors

`Rule.INVALID_REGEXP` - thrown if provided regexp fails against provided value 

#### Rule helpers
[helpers]: #rule-helpers
Here also some useful exports that can be used during schema building:
<br>**`min(n: string | number): (v) => ...`** - return function can be used to restrict string length or number count
<br>**`max(n: string | number): (v) => ...`** - see usage below

### EXAMPLES
[exmp]: #examples

#### Creating function rule
Let's assume we want to validate ``_id`` field. We can do this by creating a validation function
<br>that checks ID class and returns error (just string) if something is going wrong:
```typescript
import {Rules} from 'stigma';
error = new Rules({_id: value => (value instanceof IDClass) || 'IDClass instance expected!' })
  .validate(someObject, true)
```
You won't get the true in the promise if value is instance of the IDClass.

#### Combining several rules
Schema below contains two rules: ``String`` and ``max``
<br>The key below is expected to be of string type and no more than six chars long:
```typescript
import {Rules, max} from 'stigma';
// return error if "key" is not a string or longer than 6 chars
error = new Rules({key: [ String, max(6) ] }).validate({key: 'keyvalue'}, true)
```

<hr>

Go back to the **[top][d]**
