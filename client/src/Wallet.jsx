import server from "./server";
import { useState } from "react";

function Wallet({ address, setAddress, balance, setBalance}) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [res, setRes] = useState("");
  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function onChange(evt) {
    const address = evt.target.value;
    setAddress(address);
    
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  async function generateSig(evt) {
    evt.preventDefault();
    //TODO: send to backend and return the sig
    try {
      const {
        data: { res },
      } = await server.post(`sig/${address}`, {
        recipient: recipient,
        amount: parseInt(sendAmount)
      });
      setRes(res);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container wallet" onSubmit={generateSig}>
      <h1>Generate Sig For wallet</h1>

      <label>
        Wallet Address
        <input placeholder="Type an address, for example: 0x1" value={address} onChange={onChange}></input>
      </label>
      <label>
        Recipient 
        <input placeholder="Type an address, for example: 0x1" value={recipient} onChange={setValue(setRecipient)}></input>
      </label>
      <label>
        Send AMT
        <input placeholder="Amt to send" value={sendAmount} onChange={setValue(setSendAmount)}></input>
      </label>
      <div className="balance">Balance: {balance}</div>
      <input type="submit" className="button" value="Generate" />
      <br></br>
      <div className="balance">Res: {res}</div>
    </form>
  );
}

export default Wallet;
