  import {SchemaMixed, Stigma} from './stigma';
  function checkIfError (error){
    if(typeof error == 'string' ){throw new Error(error) }
  }
  
  let char = {
        name  : 'Jake'
      , friend: 'Finn'
      , email : 'JakeTheDog$example.com'
  }
  
  let charSchema: SchemaMixed<typeof char> = {
       name     :  'string'
      ,friend   :  function (value){ value == 'Finn' ?  null : 'Finn the only best friend!'}
      ,email    : ['string',(value, key) => value.includes('@') ? null : 'Invalid email! ']
  }
  let validator = new Stigma(charSchema);
  let error     = validator.validateOf(char);
                  validator.validateOf(char,checkIfError); // async style
      checkIfError(error)  // => Error: Invalid email!