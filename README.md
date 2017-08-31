<!-- [![Image caption](/project.logo.jpg)](#) -->

# PROJECT
**[START][gt] | [USAGE][u] | [API][a] | [EXPLAINED][e]| [AUTHOR][c] | [CONTRIBUTE][cpl] | [LICENSE][cpl] | [SUPPORT][ps]**

[d]: #project

Stigma is fast and powerful dynamic JavaScript schema validator. It can be used in Node.js and in all modern browsers.
<br> Results of testing in old browsers haven't been established yet. 

# THE PROBLEM
Is is hard to keep your data consistent throughout a project.
<br>You need to routinely check it to make it sure it didn't get wrong during runtime while user types in.
<br>If we do it manually by ``if/then`` statements at some point it is becomes messy very quickly.
<br>The Stigma simplifies this way allowing us to specify the schema that would 
<br>validate data against every time it gets changed so that solving the problem easily.

<br>Imagine user have made a mistake inside the mail field and then we get this data model:
```typescript
  import {SchemaMixed, Stigma} from './stigma'
  let user = {
        name  : 'Jake'
      , friend: 'Finn'
      , email : 'JakeTheDog$example.com'
  }
```
Did you spot that mistake out there? Let's see how we could handle this case by Stigma validator and detect the error.
<br>At first, we cast our schema which is just the shape of our object:
```typescript
  let userSchema: SchemaMixed<typeof user> = {
       name     :  String
      ,friend   :  function (value){ value == 'Finn' ?  null : 'Finn the only best friend!'}
      ,email    : [String,(value, key) => value.includes('@') ? null : 'Invalid email! ']
  }
```

Now creating our user validator and validate it:
```typescript
  let validator = new Stigma(userSchema)
  let error     = validator.validateOf(user) // => Invalid email!
```
To see whole example follow [here](/example.ts)

## GETTING STARTED
[gt]: #getting-started 'Getting started guide'
### REQUIREMENTS
[rq]: #requirements
Before you start make sure you have NodeJS installed and available in your global ``PATH`` variable.

### INSTALLATION
[i]: #installation 'Installation guide' 

```shell
$ cd your/project/path
$ npm i hinell/stigma -S
```
## USAGE
[u]: #usage 'Product usage'

```typescript
  let dataStructure = {_id: ..., description: 'Something firing up....'}
  let schema        = {_id: ..., description: String } // String here is a rule for checking
  let validator     = new Stigma(schema)
  let error         = validator.validateOf(dataStructure)
```
### Exampe of adding new validator
Let's assume we want to add ``_id`` field validation, but how we do this?
<br>Just let's flavour our schema. Add one function that checks ID class and returns a string message that would be an error later:
```typescript
  let schema        = {_id (value){
    return (value instanceof SomeIDClass) ? null : 'IDClass instance expected!'
  }}
  let validator     = new Stigma(schema)
      validator.validateOf(dataScturcture,function (error){
        if(error) ... 
        ok(dataScturcture)
      })
```


## API
[a]: #api 'Module\'s API description'
#### WARNING!: This api is subject to change! Make sure you know what you're doing!

```typescript
let schema    = {key: String}; 
let somedata  = {key: 'keyvalue'};
let validator = new Stigma(schema);
let error     = validator.validateOf(someObject);
                validator.validateOf(error => ... )
```
Where ``String`` in the ``{key: String}`` is called a Rule. Possible rules are the following:
```typescript
function(value, field): String | Error
Function | Number| String| Boolean| Array| Date
```

The latest are considered a special ``'words'`` for every of which Stigma keeps special validator. 
<br>Check out the [Stigma](./src/stigma.ts#L1) source code for more details.

### CHANGES
### Since API 1.0
#### Schema: Rules ('string','number' etc.)
Rules like ``'string'``, ``'number'`` or ``'array'`` now are legacy and would be deprecated in the near future.
<br>You'll be warned if you are using them.
<br>Use ``String``, ``Number`` or ``Array`` instead like proposed above.
<br>Currently the code that uses such type keys would be warned by loggin message.

## STIGMA EXPLAINED
[e]: #stigma-explained
The main idea behind this module is to address the need of checking the validity of some ``data``
<br>structure (key-value storage) by means of schema ``validation``.
<br>The ``schema`` is just a shape (JSON or just JS object) which we *cast* out from existing data instance
<br>by specifying each key with type checker 
<br>(there are several built-in that can be called in by passing js constructor name like ``Number``)
<br>corresponding to keys of ``data`` instance.
<br>Then using validator created by **Stigma** from casted schemas we can validate our data
<br>relieving us from difficulties with type and value checking.

## AUTHOR
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
