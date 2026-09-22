import React,{useEffect,useState}from"react";
import{createRoot}from"react-dom/client";
import{Contract,formatUnits,parseUnits,BrowserProvider,isAddress}from"ethers";
import{createAppKit,useAppKit,useAppKitAccount,useAppKitProvider}from"@reown/appkit/react";
import{EthersAdapter}from"@reown/appkit-adapter-ethers";
import{bsc}from"@reown/appkit/networks";
import"@reown/appkit/styles.css";
import"./styles.css";

const GBK="0xdA0638EA374c4c5bF2914E6F4D5B2335dEb8D80D";
const ABI=[
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to,uint256 amount) returns (bool)"
];
const projectId="19d21bb0657b8a691c0ea8f4976ce26e";

createAppKit({
  adapters:[new EthersAdapter()],
  networks:[bsc],
  projectId,
  metadata:{
    name:"GBKAI Pay",
    description:"Global blockchain payments powered by GBKAI",
    url:"https://pay.gbkai.com",
    icons:["https://gbkai.com/favicon.ico"]
  },
  themeMode:"dark",
  features:{analytics:true,swaps:false}
});

const short=a=>a?a.slice(0,6)+"…"+a.slice(-4):"";
const errorText=e=>{
  if(e?.code==="ACTION_REJECTED")return"Transaction cancelled in wallet.";
  if(e?.code==="INSUFFICIENT_FUNDS")return"Not enough BNB for network fee.";
  return e?.shortMessage||e?.reason||e?.message||"Transaction failed.";
};

function App(){
  const[tab,setTab]=useState("home");
  const[balance,setBalance]=useState("0");
  const[decimals,setDecimals]=useState(8);
  const[recipient,setRecipient]=useState("");
  const[amount,setAmount]=useState("");
  const[msg,setMsg]=useState("");
  const[busy,setBusy]=useState(false);
  const[txHash,setTxHash]=useState("");
  const{open}=useAppKit();
  const{address,isConnected}=useAppKitAccount();
  const{walletProvider}=useAppKitProvider("eip155");

  async function loadBalance(){
    if(!address||!walletProvider){setBalance("0");return}
    try{
      const provider=new BrowserProvider(walletProvider);
      const token=new Contract(GBK,ABI,provider);
      const [raw,dec]=await Promise.all([token.balanceOf(address),token.decimals()]);
      setDecimals(Number(dec));
      setBalance(formatUnits(raw,Number(dec)));
    }catch(e){setMsg(errorText(e))}
  }

  useEffect(()=>{let cancelled=false;(async()=>{if(!address||!walletProvider){setBalance("0");return}try{
    const provider=new BrowserProvider(walletProvider);
    const token=new Contract(GBK,ABI,provider);
    const [raw,dec]=await Promise.all([token.balanceOf(address),token.decimals()]);
    if(!cancelled){setDecimals(Number(dec));setBalance(formatUnits(raw,Number(dec)))}
  }catch(e){if(!cancelled)setMsg(errorText(e))}})();return()=>{cancelled=true}},[address,walletProvider]);

  async function connect(){
    try{setMsg("");await open({view:"Connect"})}catch(e){setMsg(errorText(e))}
  }

  async function sendGBK(){
    if(!isConnected||!walletProvider){await connect();return}
    setMsg("");setTxHash("");
    if(!isAddress(recipient)){setMsg("Enter a valid BNB Smart Chain recipient address.");return}
    if(!amount||Number(amount)<=0){setMsg("Enter a GBK amount.");return}
    try{
      setBusy(true);
      const provider=new BrowserProvider(walletProvider);
      const network=await provider.getNetwork();
      if(network.chainId!==56n){setMsg("Please switch your wallet to BNB Smart Chain (Chain ID 56).");return}
      const signer=await provider.getSigner();
      const token=new Contract(GBK,ABI,signer);
      const raw=await token.balanceOf(address);
      const units=parseUnits(amount,String(decimals));
      if(units>raw){setMsg("Insufficient GBK balance.");return}
      const tx=await token.transfer(recipient,units);
      setTxHash(tx.hash);
      setMsg("Transaction submitted. Waiting for confirmation…");
      await tx.wait();
      setMsg("GBK payment confirmed on BNB Smart Chain.");
      setAmount("");
      await loadBalance();
    }catch(e){setMsg(errorText(e))}finally{setBusy(false)}
  }

  const account=isConnected?address:"";

  return <div className="app"><header><a className="brand" href="#" onClick={e=>{e.preventDefault();setTab("home")}}><b>GB</b><span><strong>GBKAI <i>Pay</i></strong><small>Global blockchain payments</small></span></a><nav>{["home","pay","receive","activity"].map(x=><button key={x} className={tab===x?"active":""} onClick={()=>setTab(x)}>{x[0].toUpperCase()+x.slice(1)}</button>)}</nav><button className="connect" onClick={connect}>{account?short(account):"Connect Wallet"}</button></header>
  <main><section className="hero"><div><label>GBANK APY • GBK • BNB SMART CHAIN</label><h1>Pay globally.<br/><em>Powered by GBKAI.</em></h1><p>A simple payment layer for GBank APY (GBK), merchants and AI-powered services.</p><div className="actions"><button className="primary" onClick={connect}>{account?"Wallet Connected":"Connect & Pay"}</button><button className="secondary" onClick={()=>setTab("receive")}>Receive Payment</button></div>{msg&&<div className="msg">{msg}</div>}{txHash&&<a className="tx" target="_blank" rel="noreferrer" href={"https://bscscan.com/tx/"+txHash}>View transaction on BscScan ↗</a>}</div><div className="wallet"><div className="top">GBK WALLET <span>● {isConnected?"Connected":"Ready"}</span></div><small>Available GBK</small><strong>{Number(balance||0).toLocaleString(undefined,{maximumFractionDigits:8})}</strong><code>{account||"Connect wallet to view balance"}</code><div className="walletBtns"><button onClick={()=>setTab("pay")}>↗ Pay</button><button onClick={()=>setTab("receive")}>↙ Receive</button></div></div></section>
  <section className="cards">{[["01","GBK Payments","Send GBK directly from a connected wallet on BNB Smart Chain."],["02","Wallet Connectivity","Reown AppKit supports wallet connection in normal browsers and mobile flows."],["03","Merchant Tools","Payment links, QR, invoices and transaction records can build on this core."],["04","Future Rails","Stablecoins, AI-assisted payments and ZK verification can be added as separate modules."]].map(x=><article key={x[0]}><span>{x[0]}</span><h3>{x[1]}</h3><p>{x[2]}</p></article>)}</section>
  <section className="panel">{tab==="home"?<><label>HOW IT WORKS</label><h2>Connect • Review • Sign • Settle</h2><div className="steps">{[["01","Connect","Connect a supported wallet."],["02","Choose","Enter the recipient and GBK amount."],["03","Review","Check address, amount and network."],["04","Sign","Approve the transfer in your wallet."],["05","Settle","The confirmed transaction is recorded on BNB Smart Chain."]].map(x=><div key={x[0]}><b>{x[0]}</b><h3>{x[1]}</h3><p>{x[2]}</p></div>)}</div></>:tab==="pay"?<div className="empty"><h2>Send GBK</h2><p>Send GBK directly to a BNB Smart Chain address. Always verify the recipient before confirming.</p><input value={recipient} onChange={e=>setRecipient(e.target.value.trim())} placeholder="Recipient 0x…" inputMode="text"/><input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="GBK amount" inputMode="decimal"/><button className="primary wide" disabled={busy} onClick={sendGBK}>{busy?"Processing…":"Send GBK"}</button>{account&&<small className="hint">From: {short(account)} · Decimals: {decimals}</small>}</div>:tab==="receive"?<div className="empty"><h2>Receive GBK</h2><p>Share this wallet address with the sender. No blockchain transaction is created until the sender confirms a payment.</p><code>{account||"Connect wallet first"}</code><button className="secondary wide" onClick={async()=>{if(account)await navigator.clipboard?.writeText(account);setMsg(account?"Address copied.":"Connect wallet first.")}}>Copy Address</button></div>:<div className="empty"><h2>Transaction Activity</h2><p>Use the BscScan transaction link after a payment. A dedicated indexed activity page can be added next.</p><a className="secondary wide linkbtn" target="_blank" rel="noreferrer" href={account?"https://bscscan.com/address/"+account:"https://bscscan.com"}>Open BscScan</a></div>}</section></main><footer>GBKAI Pay · GBank APY (GBK) · BNB Smart Chain</footer></div>
}
createRoot(document.getElementById("root")).render(<App/>);
