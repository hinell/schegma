import {SchemaMixed, Stigma} from './stigma'
import * as assert from "assert";
let user = {
    name  : 'Jake'
  , friend: 'Finn'
  , email : 'JakeTheDog$example.com'
}

let userSchema: SchemaMixed<typeof user> = {
   name     :  String
  ,friend   :  function (value){ value == 'Finn' ?  null : 'Finn the only best friend!'}
  ,email    : [String,(value, key) => value.includes('@') ? null : 'Invalid email! ']
}

new Stigma(userSchema)
  .validateOf(user)
  .then(
      function (object){ throw new Error('Invalid testing: validation should fail at email property value') }
    , function (err){ assert.ok(err); console.log('passed: example')})
  .catch(err => console.log(err) )
