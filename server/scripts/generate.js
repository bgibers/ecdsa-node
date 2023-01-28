const secp = require("ethereum-cryptography/secp256k1");
const fs = require('fs');
const color = require("cli-color");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

var jsonData = [];
for (var i = 0; i < 3; i ++) {
    const privKey =  toHex(secp.utils.randomPrivateKey());
    const publicKey = toHex(secp.getPublicKey(privKey));
    const prettyAddress = getAddress(secp.getPublicKey(privKey));

    console.log(`Public Key: ${color.green(publicKey)}`)
    console.log(`Private Key: ${color.red(privKey)}`)
    console.log(`Pretty Address: ${color.green(prettyAddress)}`)
    jsonData.push({privKey: privKey, pubKey: publicKey, address: prettyAddress})
}

json = JSON.stringify(jsonData); 
fs.writeFile('wallets.json', json, 'utf8', function(err){
    if(err) throw err;
});

function getAddress(publicKey) {
  return toHex(keccak256(publicKey.slice(1)).slice(-20))
}

