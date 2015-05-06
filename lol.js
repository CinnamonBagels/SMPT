var nodeRSA = require('node-rsa');
var keypair = require('keypair');

var pair = keypair();

var publicKey = new nodeRSA(pair.public);

var encrypted = publicKey.encrypt('LOL', 'base64');

console.log(encrypted);

var privateKey = new nodeRSA(pair.private);

var decrypted = privateKey.decrypt(encrypted);
console.log(decrypted );