import { browser } from "wxt/browser";
import "./style.css";
async function check(){
 try{
  const[substack,medium]=await Promise.all([browser.cookies.getAll({domain:"substack.com"}),browser.cookies.getAll({domain:"medium.com"})]);
  const active=(c:{expirationDate?:number})=>!c.expirationDate||c.expirationDate>Date.now()/1000;
  const statuses={substack:substack.some(c=>c.name==="substack.sid"&&active(c)),medium:medium.some(c=>["uid","sid"].includes(c.name)&&active(c))};
  for(const[id,connected]of Object.entries(statuses)){const el=document.getElementById(id)!;el.textContent=connected?"Session detected":"Not connected";el.className=connected?"connected":"";}
 }catch{document.getElementById("error")!.textContent="Connection check failed. Try refreshing.";}
}
document.getElementById("check")!.addEventListener("click",check);
void check();
