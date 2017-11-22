<!-- [![Image caption](/project.logo.jpg)](#) -->


# STIGMA
[d]: #stigma

![](https://img.shields.io/github/license/hinell/stigma.svg?style=flat-square)
![](https://img.shields.io/github/package-json/v/hinell/stigma.svg?style=flat-square)
[![Travis](https://img.shields.io/travis/hinell/stigma.svg?style=flat-square)]()

**[START][gt] | [USAGE][u] | [API][a] | [EXAMPLES][exmp] | [AUTHOR][auth] | [CONTRIBUTE][cpl] | [LICENSE][cpl] | [SUPPORT][ps]**

[exmp]: api.md#examples
[a]: api.md

> Declarative JavaScript and TypeScript js object schema validation tool.

```typescript
new Rules({
    name      : [String, min(4)]
  , password  : [String, min(6)]
  , email     : [String, (string) => /@/g.test(string) || '@ is missing!' ]
  , biography : ['optional', String, min(32), max(512)]
  , birthDate : ['optional', Date]
  , code      : ['optional', Number]
}).validate({
    name      : 'Ragnarök'
  , password  : '12345qwerty'
  , email     : 'what?'
},true); // => '@ is missing!'

```

### ALTERNATIVES
**Q:** Why don't to use joi or any other schema-validation library instead?
<br>**A:** Well the reason of this is that some of these libraries
<br>are too complicated and time-expensive to learn for me.
<br>The Stigma was created as ad-hoc solution and isn't intended 
<br>to be replacement for any of these useful librariess.
<br>You are free to choose any.

## GETTING STARTED
[gt]: #getting-started 'Getting started guide'
[rq]: #requirements
Before you start make sure you have NodeJS installed and available in your global ``PATH`` variable.

### INSTALLATION
[i]: #installation 'Installation guide' 

```shell
$ cd your/project/path
$ npm i -S hinell/stigma 
```
### USAGE
[u]: #usage 'Product usage'

```typescript
  import {Rules} from 'stigma';
  let schema        = {description: String }
  let dataStructure = {description: 'Description of most powerful library ever....'};
  let error         =  new Rules(schema).validate(dataStructure,true);
  //  do something with error
```
## AUTHOR
[auth]: #author 'Credits & author\'s contacts info'
You can follow me on [twitter](https://twitter.com/biteofpie) or just [email](mailto:al.neodim@gmail.com) me.

## CONTRIBUTION & LICENSE
[cpl]:#contribution--license 'Contribution guide & license info'

Check out (if any) [contribution guide](CONTRIBUTION) or [license](LICENSE) for more details.

## PRODUCTION STATUS & SUPPORT
[ps]: #production-status--support 'Production use disclaimer & support info'

You should be aware that the library is not supported by anyone except me.
<br>None gurantees bugless behaviour (though currenlty it is fully covered by tests). 

If you want to become a **patron** of this project or offer me a **support** please [follow here][auth].

<hr>

Go back to the **[project description][d]**
