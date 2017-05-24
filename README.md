<!-- [![Image caption](/project.logo.jpg)](#) -->

# STIGMA
**[INSTALL][i] | [USAGE][u] | [API][a] | [CREDITS][c] | [CONTRIBUTE][cpl] | [LICENSE][cpl]**

## DESCRIPTION/USE CASE
A quick yet powerful JS/TS schema validator:

```typescript
  // src/example.ts
  import {SchemaMixed, Stigma} from './stigma';
  // miscellaneous
  let checkIfError = function (error){
    if(typeof error == 'string' ){throw new Error(error) }
  }
  // let's create an imaginary character
  let char = {
        name  : 'Jake'
      , friend: 'Finn'
      , email : 'JakeTheDog$example.com'
  }
  // it's schema...
  let charSchema: SchemaMixed<typeof char> = {
       name     :  'string'
      ,friend   :  function (value){ value == 'Finn' ?  null : 'Finn the only best friend!'}
      ,email    : ['string',(value, key) => value.includes('@') ? null : 'Invalid email! ']
  }
  // and it's validator
  let validator = new Stigma(charSchema);
  // now, let's validate it to "catch" any error occurs: 
  let error     = validator.validateOf(char);
                  validator.validateOf(char,checkIfError); // async style
      checkIfError(error)  // => Error: Invalid email!
```


## INSTALLATION
[i]: #installation 'Installation guide'

```shell
$ cd your/project/path
$ npm i hinell/stigma -S

```

## USAGE
[u]: #usage 'Module usage'

***DATA, SCHEMA, VALIDATOR (DSV)*** <br>
TLDR; The main idea behind this module is to address the need of checking out the validity of some run-time ``data`` (denotes **D**)<br>
structure by means of schema ``validation`` against its instance.<br>
The ``schema`` (**S**) here is just a shape (object) which we want to *cast* out from existing data instance<br>
each key of which (schema) denotes the value type (but not only) that the ``data``'s keys are expected to contain.
The process of a such comparison is the exact thing that **Stigma** (**V**) do: validates some schema against doubtful object containing data<br>
relieving us from tonnes of heavy input checking code taking that routines on itself.

```typescript
  let dataStructure = {_id: ..., description: 'Something firing up....'}
  let schema        = {_id: ..., description: 'string '}
```
Let's assume we want to add ``_id`` field validation, but how we do this?
Just let's flavour our schema by one function that returns a string signifying an error message that we could use later:
```typescript
  let schema        = {_id: function checkIfId(value){
    return value instanceof SomeIDClass ? null : 'IDClass instance expected!'
  }}
```


### API
[a]: #api 'Module\'s API description'
#### WARNING: 
This api is subject to change!
Make sure you know what you're doing!

```typescript
// where the key could be any of 'string' | 'number' | 'array' | 'optional' | 'required' or array of specified types
let schema    = {key: 'string'}; 
let somedata  = {key: 'value'};
let validator = new Stigma(schema);
let error     = validator.validateOf(someObject);
                validator.validateOf(someObject,function(error){  })
```

### CREDITS/CONTACT AUTHOR
[c]: #creditscontact-author 'Credits & author\'s contacts info '
You can follow me on [twitter](https://twitter.com/biteofpie) or just [email](mailto:al.neodim@gmail.com) me.

### CONTRIBUTION, PRODUCTION USE & LICENSE

[cpl]:#contribution-production-use--license 'Contribution guide, usage in production status & license info'

Follow (if any present) to the <a href='/CONTRIBUTION'>contribution guide</a> or <a href='/LICENSE'>license</a> for more details.
