import React,{useEffect,useState}from"react";
import{createRoot}from"react-dom/client";
import{Contract,formatUnits,BrowserProvider}from"ethers";
import{createAppKit,useAppKit,useAppKitAccount,useAppKitProvider}from"@reown/appkit/react";
import{EthersAdapter}from"@reown/appkit-adapter-ethers";
import{bsc}from"@reown/appkit/networks";
import"@reown/appkit/styles.css";
import"./styles.css";

const GBK="0xdA0638EA374c4c5bF2914E6F4D5B2335dEb8D80D";
const ABI=["function balanceOf(address) view returns (uint256)"];
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

function App(){
  const[tab,setTab]=useState("home");
  const[balance,setBalance]=useState("0");
  const[msg,setMsg]=useState("");
  const{open}=useAppKit();
  const{address,isConnected}=useAppKitAccount();
  const{walletProvider}=useAppKitProvider("eip155");

  useEffect(()=>{
    let cancelled=false;
    async function loadBalance(){
      if(!address||!walletProvider){setBalance("0");return}
      try{
        const provider=new BrowserProvider(walletProvider);
        const token=new Contract(GBK,ABI,provider);
        const raw=await token.balanceOf(address);
        if(!cancelled)setBalance(Number(formatUnits(raw,8)).toLocaleString(undefined,{maximumFractionDigits:4}));
      }catch(e){
        if(!cancelled)setMsg(e?.shortMessage||e?.message||"Could not read GBK balance.");
      }
    }
    loadBalance();
    return()=>{cancelled=true};
  },[address,walletProvider]);

  async function connect(){
    try{
      setMsg("");
      await open({view:"Connect"});
    }catch(e){setMsg(e?.message||"Wallet connection failed.")}
  }

  const account=isConnected?address:"";

  return <div className="app"><header><a className="brand" href="#" onClick={e=>{e.preventDefault();setTab("home")}}><b>GB</b><span><strong>GBKAI <i>Pay</i></strong><small>Global blockchain payments</small></span></a><nav>{["home","pay","receive","activity"].map(x=><button key={x} className={tab===x?"active":""} onClick={()=>setTab(x)}>{x[0].toUpperCase()+x.slice(1)}</button>)}</nav><button className="connect" onClick={connect}>{account?short(account):"Connect Wallet"}</button></header>
  <main><section className="hero"><div><label>GBANK APY • GBK • BNB SMART CHAIN</label><h1>Pay globally.<br/><em>Powered by GBKAI.</em></h1><p>A simple payment layer for GBank APY (GBK), stablecoins, merchants and AI-powered services.</p><div className="actions"><button className="primary" onClick={connect}>{account?"Wallet Connected":"Connect & Pay"}</button><button className="secondary" onClick={()=>setTab("receive")}>Receive Payment</button></div>{msg&&<div className="msg">{msg}</div>}</div><div className="wallet"><div className="top">GBK WALLET <span>● {isConnected?"Connected":"Ready"}</span></div><small>Available GBK</small><strong>{balance}</strong><code>{account||"Connect wallet to view balance"}</code><div className="walletBtns"><button onClick={()=>setTab("pay")}>↗ Pay</button><button onClick={()=>setTab("receive")}>↙ Receive</button></div></div></section>
  <section className="cards">{[["01","GBK Payments","Use GBank APY (GBK) for supported ecosystem payments."],["02","Stablecoins","Ready for stablecoin payment rails and merchant settlement."],["03","Merchant Tools","QR, payment links, invoices and transaction history."],["04","ZK Ready","Future privacy-preserving verification for selected flows."]].map(x=><article key={x[0]}><span>{x[0]}</span><h3>{x[1]}</h3><p>{x[2]}</p></article>)}</section>
  <section className="panel">{tab==="home"?<><label>HOW IT WORKS</label><h2>Ask • Connect • Pay • Grow</h2><div className="steps">{[["01","Choose","Select a service or merchant."],["02","Connect","Connect through Reown WalletConnect."],["03","Pay","Use GBK or a supported method."],["04","Verify","Future ZK infrastructure can verify selected conditions."],["05","Settle","Merchant settlement follows."]].map(x=><div key={x[0]}><b>{x[0]}</b><h3>{x[1]}</h3><p>{x[2]}</p></div>)}</div></>:tab==="pay"?<div className="empty"><h2>Pay with GBK</h2><p>Wallet connection is ready. The GBK transfer/checkout contract integration comes next.</p><button className="primary" onClick={connect}>{account?"Connected":"Connect Wallet"}</button></div>:tab==="receive"?<div className="empty"><h2>Receive GBK</h2><p>Your connected wallet can be used as the receiving address.</p><code>{account||"Connect wallet first"}</code></div>:<div className="empty"><h2>Transaction Activity</h2><p>BNB Chain indexing will be connected in the next integration stage.</p></div>}</section></main><footer>GBKAI Pay · GBank APY (GBK) · BNB Smart Chain · AI + ZK Ready</footer></div>
}
createRoot(document.getElementById("root")).render(<App/>);