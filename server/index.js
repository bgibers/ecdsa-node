const asyncHandler = require('express-async-handler')
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const fs = require('fs');
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const secp = require("ethereum-cryptography/secp256k1");

app.use(cors());
app.use(express.json());

const balances = {
  "e68c86914ece0fda6de05357c595d413f742b14c": 100,
  "1cc420472558cd0e2968c94079544a1e119a21aa": 50,
  "cda79752bb40949a78098f3e0053611f33ba851a": 75,
};

const pubKeys = {
  "e68c86914ece0fda6de05357c595d413f742b14c": "04aa151d61c373a5a3148e1ad3352b2efa11dbe0467c0b2b9d1968c9805dd2dad43f8384135d8fb35c1cd6699309055269c745b056a4712e0ec02afec77663fb92",
  "1cc420472558cd0e2968c94079544a1e119a21aa": "04b6920b2eadb974df8afc072f45e088e00dcabd41dfe6ed420582e0f2b222fd5f3b2166f64c67a148bd009fbf40e45db8771eaa49bc37284b7ba0134aac755f58",
  "cda79752bb40949a78098f3e0053611f33ba851a": "04a1d1fce4cd8e1cb912fa92ecf59096cd97bee50177064b71cf066f10636d1391f8728aeda4585488a95daa0040d74aa2f9c6364172badd19dbf87adfec5703c0",
}

const sigs = {}

app.get("/balance/:address", async (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/sig/:address", async (req, res) => {
  const { address } = req.params;
  const { recipient, amount} = req.body;

  await generateSig(address, recipient, amount);

  res.send({ res: "Sig generated success" });
})

app.post("/send", (req, res) => {
  const { sender, recipient, amount } = req.body;

  const hashedMsg = keccak256(utf8ToBytes((JSON.stringify({
    sender,
    amount,
    recipient
  }))));


  if(!verifySigAndMsg(sender, hashedMsg))
  {
    res.status(400).send({ message: "TX not verified" });
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

//TODO: function to generate and save sig
// function to verify if sig is legit
// function to generate message hash
async function generateSig(sender, recipient, amount) {
  fs.readFile('wallets.json', 'utf8', async function(err, data) {
    if (err){
      console.log(err);
    } else {
      jsonData = JSON.parse(data); 
      var keyPair = jsonData.find(e => e.address === sender);

      var hashedMsg = keccak256(utf8ToBytes((JSON.stringify({
        sender,
        amount,
        recipient
      }))));

      sigs[sender] = await secp.sign(hashedMsg, keyPair.privKey, { recovered: true});
    }
  })
}

function verifySigAndMsg(sender, messageHash) {
  const signature = sigs[sender];

  if(!secp.verify(signature[0], toHex(messageHash), pubKeys[sender])){
    return false
  } 

  sigs[sender] = {}
  return true
}

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
