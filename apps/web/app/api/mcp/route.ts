import { z } from "zod";
import { apiError, readJson, userDatabase, rateLimit } from "@/lib/server";
const envelope=z.object({jsonrpc:z.literal("2.0"),id:z.union([z.string(),z.number()]).optional(),method:z.string(),params:z.record(z.unknown()).optional()});
// Minimal stateless MCP JSON transport; intentionally read-only. No API-key issuer or OAuth flow.
export async function POST(request:Request){
 try{
  const {db,userId}=await userDatabase();rateLimit(`mcp:${userId}`,60);const message=envelope.parse(await readJson(request,20000));
  if(message.id===undefined)return new Response(null,{status:202});
  const reply=(result:unknown)=>Response.json({jsonrpc:"2.0",id:message.id,result});
  if(message.method==="initialize")return reply({protocolVersion:"2025-03-26",capabilities:{tools:{listChanged:false}},serverInfo:{name:"polar-publish",version:"0.1.0"}});
  if(message.method==="ping")return reply({});
  if(message.method==="tools/list")return reply({tools:[{name:"search_archive",description:"Search the authenticated writer's imported archive by title.",inputSchema:{type:"object",properties:{query:{type:"string",maxLength:100}},additionalProperties:false},annotations:{readOnlyHint:true}}]});
  if(message.method==="tools/call"){
   const params=z.object({name:z.literal("search_archive"),arguments:z.object({query:z.string().max(100).default("")}).default({})}).safeParse(message.params);
   if(!params.success)return Response.json({jsonrpc:"2.0",id:message.id,error:{code:-32602,message:"Unknown tool or invalid arguments"}});
   const {data,error}=await db.from("archive_entries").select("title,url,content").eq("user_id",userId).order("created_at",{ascending:false}).limit(100);
   if(error)throw error;const matches=(data||[]).filter(a=>a.title.toLowerCase().includes(params.data.arguments.query.toLowerCase())).slice(0,10);
   return reply({content:[{type:"text",text:JSON.stringify(matches)}]});
  }
  return Response.json({jsonrpc:"2.0",id:message.id,error:{code:-32601,message:"Method not found"}});
 }catch(error){return apiError(error);}
}
