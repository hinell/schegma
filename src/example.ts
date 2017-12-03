// <reference  path='./stigma.d.ts'>
import {max, min, Rules as Rules} from './stigma'

new Rules({
   name     : String
  ,friend   : (value, key, rule) => value === 'Finn' || 'Finn the only best friend!'
  ,email    : [String,(value, key, rule) => value.includes('@') || 'Email is invalid! ']
})
.validate({
    name  : 'Jake'
  , friend: 'Finn'
  , email : 'JakeTheDog$example.com'
})
.then(
    function (){ throw new Error('Invalid testing: validation should fail at email property value') }
  , function (){ console.log('example.js: example ok') })
.catch(err => {if(err){ throw err }} )

try {
  new Rules({
      name     : [String, min(4)]
    , password : [String, min(6)]
    , email    : [String, (string) => /@/g.test(string) || '@ is missing!']
    , biography: ['optional', String, min(32), max(512)]
    , birthDate: ['optional', Date]
    , code     : ['optional', Number]
  }).validate({
      name    : 'Ragnarok'
    , password: '12345qwerty'
    , email   : 'what?'
  }, true);
} catch (e) {
  // throws Rule.INVALID_VALUE error with '@ is missing!' message
}
