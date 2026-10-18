import { HttpError } from "./errors";
export function validateFeedUrl(value:string){
 let url:URL;try{url=new URL(value);}catch{throw new HttpError(400,"Enter a valid RSS URL.");}
 const host=url.hostname.toLowerCase();
 if(url.protocol!=="https:"||url.username||url.password||(url.port&&url.port!=="443")||!(host.endsWith(".substack.com")||host==="medium.com"||host.endsWith(".medium.com")))throw new HttpError(400,"Only HTTPS Substack and Medium feeds are supported. Custom domains are not enabled.");
 return url;
}
export async function fetchFeed(url:URL){
 const response=await fetch(url,{redirect:"error",signal:AbortSignal.timeout(12000),headers:{Accept:"application/rss+xml, application/xml, text/xml"}});
 if(!response.ok)throw new HttpError(502,"The feed could not be fetched. Check its public RSS URL.");
 const reader=response.body?.getReader();if(!reader)throw new HttpError(502,"The feed was empty.");
 let size=0;const chunks:Uint8Array[]=[];
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>2_000_000){await reader.cancel();throw new HttpError(413,"Feed exceeds the 2 MB import limit.");}chunks.push(value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
 const xml=new TextDecoder().decode(bytes);
 if(/<!DOCTYPE|<!ENTITY/i.test(xml))throw new HttpError(400,"Feeds with XML entities or document type declarations are not supported.");
 return xml;
}
