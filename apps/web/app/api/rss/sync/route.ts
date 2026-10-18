import Parser from "rss-parser";
import { z } from "zod";
import { apiError, HttpError, readJson, userDatabase, rateLimit } from "@/lib/server";
import { fetchFeed, validateFeedUrl } from "@/lib/rss";
import { safeUrl } from "@/lib/content";
export const runtime="nodejs";
export async function POST(request:Request){
 try{
  const {db,userId}=await userDatabase();rateLimit(`rss:${userId}`,5);
  const {rssUrl}=z.object({rssUrl:z.string().url().max(2000)}).parse(await readJson(request,5000));
  const url=validateFeedUrl(rssUrl);const xml=await fetchFeed(url);
  let feed;try{feed=await new Parser().parseString(xml);}catch{throw new HttpError(400,"The response is not a supported RSS or Atom feed.");}
  const rows=Array.from(new Map(feed.items.filter(i=>i.link&&safeUrl(i.link)).slice(0,50).map(item=>[item.link!,{user_id:userId,title:(item.title||"Untitled").slice(0,500),url:safeUrl(item.link!),source_feed:url.href,content:(item.contentSnippet||item.summary||"").slice(0,20000)}])).values());
  if(!rows.length)return Response.json({imported:0,embedded:0});
  const {error}=await db.from("archive_entries").upsert(rows,{onConflict:"user_id,url"});
  if(error)throw new HttpError(502,"Archive import failed. Check the schema and Clerk/Supabase authentication configuration.");
  let embedded=0;
  if(process.env.OPENAI_API_KEY){
   const selected=rows.slice(0,20);
   const result=await fetch("https://api.openai.com/v1/embeddings",{method:"POST",headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},signal:AbortSignal.timeout(30000),body:JSON.stringify({model:"text-embedding-3-small",dimensions:1536,input:selected.map(r=>`${r.title}\n${r.content}`.slice(0,8000))})});
   if(result.ok){const data=await result.json();for(const entry of data.data||[]){if(!selected[entry.index]||!Array.isArray(entry.embedding)||entry.embedding.length!==1536)continue;const {error:updateError}=await db.from("archive_entries").update({embedding:entry.embedding}).eq("user_id",userId).eq("url",selected[entry.index].url);if(!updateError)embedded++;}}
  }
  return Response.json({imported:rows.length,embedded,warning:embedded<rows.length?"Import complete; some or all entries lack embeddings. At most 20 are embedded per import.":null});
 }catch(error){return apiError(error);}
}
