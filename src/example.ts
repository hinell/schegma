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

let validator = new Stigma(userSchema)
let error     = validator.validateOf(user) // => Error: Invalid email!
    assert.ok(error)
    console.log('Example: ok')