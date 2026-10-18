import { defineBackground } from "wxt/utils/define-background";
import { browser } from "wxt/browser";

export default defineBackground(()=>{
 const allowedOrigin="http://localhost:3000";
 browser.runtime.onMessageExternal.addListener((message,sender,respond)=>{
  // Check the sender, not an origin or URL claimed inside the message body.
  let origin="";try{origin=new URL(sender.url||"").origin;}catch{respond({error:"Missing sender origin"});return false;}
  if(origin!==allowedOrigin){respond({error:"Origin not allowed"});return false;}
  if(!message||typeof message!=="object"){respond({error:"Invalid message"});return false;}
  if(message.action==="CHECK_CONNECTIONS"){
   Promise.all([browser.cookies.getAll({domain:"substack.com"}),browser.cookies.getAll({domain:"medium.com"})]).then(([substack,medium])=>{
    const active=(c:{expirationDate?:number})=>!c.expirationDate||c.expirationDate>Date.now()/1000;
    respond({substackConnected:substack.some(c=>c.name==="substack.sid"&&active(c)),mediumConnected:medium.some(c=>["uid","sid"].includes(c.name)&&active(c))});
   }).catch(()=>respond({error:"Unable to inspect publication sessions"}));
   return true;
  }
  if(message.action==="PUBLISH_POST"){
   // Intentionally fail closed. Private publisher APIs and canonical settings change.
   // Never invent a success response, transmit cookies to the dashboard, or publish silently.
   respond({success:false,error:"Automatic draft creation is not enabled. Export Markdown and review it in the publisher. Private API adapters require validation and an explicit confirmation screen."});
   return false;
  }
  respond({error:"Unknown action"});return false;
 });
});
