<!-- [![Image caption](/project.logo.jpg)](#) -->

# PROJECT
**[INSTALL][i] | [USAGE][u] | [API][a] | [CREDITS][c] | [CONTRIBUTE][cpl] | [LICENSE][cpl] | [SUPPORT][ps]**

[d]: #project

A quick yet powerful JS/TS schema validation tool with intention for Node.js server use (but potentially for browsers as well).

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

## GETTING STARTED
[gt]: #getting-started 'Getting started guide'
### REQUIREMENTS

### INSTALLATION
[i]: #installation 'Installation guide' 

```shell
$ cd your/project/path
$ npm i hinell/stigma -S

```
## USAGE
[u]: #usage 'Product usage'

Stigma concept: ***DATA, SCHEMA, VALIDATION — DSV*** <br>
**tldr;** The main idea behind this (as concisely stated above) module is to address the need of checking out the validity of some ``data`` (denotes **D**)<br>
structure (key-value storage) by means of schema ``validation`` against its instance.<br>
The ``schema`` (**S**) here is just a shape (object) which we want to *cast* out from existing data instance<br>
each key of which (schema) denotes the value type (but not only) that the ``data``'s keys are expected to contain.
The process of a such comparison is the exact thing that **Stigma** (**V**) do: 
validates during run-time object against schema proving its validity<br>
relieving us from tonnes of heavy checking code by taking all that routines on itself.

```typescript
  let dataStructure = {_id: ..., description: 'Something firing up....'}
  let schema        = {_id: ..., description: 'string '}
```
Let's assume we want to add ``_id`` field validation, but how we do this?
Just let's flavour our schema by one function that returns a string signifying an error message that we could use later:
```typescript
  let schema        = {_id: function checkIDInstance(value){
    return (value instanceof SomeIDClass) ? null : 'IDClass instance expected!'
  }}
  let validator     = new Stigma(schema)
      validator.validateOf(dataScturcture,function (error){
        if(error) ...
        resolve(dataScturcture)
      })
```

## API
[a]: #api 'Module\'s API description'
#### WARNING!: This api is subject to change! Make sure you know what you're doing!

```typescript
// where the key could be any of 'string' | 'number' | 'array' | 'optional' | 'required' or array of specified types
let schema    = {key: 'string'}; 
let somedata  = {key: 'value'};
let validator = new Stigma(schema);
let error     = validator.validateOf(someObject);
                validator.validateOf(someObject,function(error){  })
```

Check out the [Stigma](./src/stigma.ts#L1) source code for more details.

## CREDITS/CONTACT AUTHOR
[c]: #creditscontact-author 'Credits & author\'s contacts info '
You can follow me on [twitter](https://twitter.com/biteofpie) or just [email](mailto:al.neodim@gmail.com) me.

## ACKNOWLEDGMENTS
[acc]: acknowledgments

I want to praise the efforts of the people that have inspired me while <br>
I've been working on this project by briefly mention their names and projects below: <br>
...list of projects will be here soon.

## CONTRIBUTION & LICENSE
[cpl]:#contribution--license 'Contribution guide & license info'

Check out (if any) <a href='/CONTRIBUTION'>contribution guide</a> or <a href='/LICENSE'>license</a> for more details.

## PRODUCTION STATUS & SUPPORT
[ps]: #production-status--support 'Production use disclaimer & support info'

As everything is changnign all the time the production readiness of this project and its future development are
in permanent question unless it is stated otherwise.
Use of this product is entirely on your own risk. *Nobody (including me) guarantees that there is no bugs present in the code.*
I dont' have much time to eliminate them all but hardly trying to minimize them.

If you want to **help** me or offer a **job** please follow [here][c].

Go back to the **[project description][d]**
