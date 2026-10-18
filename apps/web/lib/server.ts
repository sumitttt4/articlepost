import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { ZodError } from "zod";
import { HttpError } from "./errors";
export { HttpError } from "./errors";
export async function requireUser() {
 if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) throw new HttpError(503,"Configure Clerk to use cloud APIs. The local workspace remains available.");
 const session = await auth();
 if (!session.userId) throw new HttpError(401,"Sign in to use this endpoint.");
 return session;
}
export async function userDatabase() {
 const session = await requireUser();
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL; const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if (!url || !key) throw new HttpError(503,"Configure Supabase and run the database migration first.");
 // Clerk third-party authentication in Supabase validates this token. No service-role bypass.
 const db = createClient(url,key,{accessToken:async()=>session.getToken()});
 return {db,userId:session.userId!};
}
export async function readJson(request: Request, maxBytes=150000) {
 const reader=request.body?.getReader(); if(!reader)throw new HttpError(400,"JSON request body is required.");
 const chunks:Uint8Array[]=[];let size=0;
 try { while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes){await reader.cancel();throw new HttpError(413,"Request body is too large.");}chunks.push(value);} }
 finally { reader.releaseLock(); }
 const all=new Uint8Array(size);let offset=0;for(const chunk of chunks){all.set(chunk,offset);offset+=chunk.length;}
 try{return JSON.parse(new TextDecoder().decode(all));}catch{throw new HttpError(400,"Request body must be valid JSON.");}
}
export function apiError(error: unknown) {
 if(error instanceof HttpError)return Response.json({error:error.message},{status:error.status});
 if(error instanceof ZodError)return Response.json({error:"Invalid input",details:error.flatten()},{status:400});
 console.error("API operation failed:",error instanceof Error?error.message:"Unknown error");
 return Response.json({error:"The operation failed. Check server configuration and try again."},{status:500});
}
// Development/single-instance guard. Replace with a shared limiter for multi-instance deployment.
const requests=new Map<string,{count:number;until:number}>();
export function rateLimit(key:string,max=15){
 const now=Date.now();for(const[k,v]of requests)if(v.until<now)requests.delete(k);
 const entry=requests.get(key);if(entry&&entry.count>=max)throw new HttpError(429,"Too many requests. Try again in a minute.");
 requests.set(key,{count:(entry?.count||0)+1,until:entry?.until||now+60000});
}
