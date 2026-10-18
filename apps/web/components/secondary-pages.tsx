"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus as PlusIcon, ArrowUpRight as ArrowTopRightIcon, ArrowRight as ArrowRightIcon, MessageSquare as ChatBubbleIcon, Calendar as CalendarIcon, Check as CheckIcon, Link as Link2Icon, RefreshCw as ReloadIcon, Zap as LightningBoltIcon, FileText as FileTextIcon, Bookmark as BookmarkIcon, Download as DownloadIcon, Info as InfoCircledIcon, Eye as EyeOpenIcon } from "lucide-react";
import { PlatformLogo } from "@/components/platform-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs } from "@cloudflare/kumo/components/tabs";
import { Select } from "@cloudflare/kumo/components/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { DateTimePicker } from "@/components/date-time-picker";
import { useWorkspace } from "@/components/workspace-provider";
import { seoChecks, seoScore, safeUrl, type Note } from "@/lib/content";
import { checkExtension } from "@/lib/extension";
import { cn } from "@/lib/utils";
import { Checkbox } from "@cloudflare/kumo/components/checkbox";

const NOTE_TABS=[{id:"all",label:"All notes"},{id:"queued",label:"Scheduled"},{id:"draft",label:"Drafts"}] as const;
export function NotesQueue(){
 const{notes,setNotes,articles}=useWorkspace();const[filter,setFilter]=useState("all");const[editing,setEditing]=useState<Note|null>(null);const[open,setOpen]=useState(false);
 const add=()=>{setEditing({id:crypto.randomUUID(),articleId:articles[0]?.id||"",body:"",scheduledFor:"",status:"draft"});setOpen(true);};
 const save=()=>{if(!editing?.body.trim()){toast.error("Give your note a little something to say.");return;}if(editing.status==="queued"&&(!editing.scheduledFor||Date.parse(editing.scheduledFor)<=Date.now())){toast.error("Choose a future time for a queued note.");return;}setNotes(notes.some(n=>n.id===editing.id)?notes.map(n=>n.id===editing.id?editing:n):[...notes,editing]);setOpen(false);toast.success("Note saved locally.");};
 const remove=()=>{if(!editing)return;setNotes(notes.filter(n=>n.id!==editing.id));setOpen(false);toast.success("Note removed from this browser.");};
 return <div className="page">
  <div className="page-heading"><div><div className="heading-eyebrow">SMALL SPARKS, BIG IDEAS</div><h1>Keep the conversation going.</h1><p>A little of your thinking, out in the world.</p></div><Button onClick={add}><PlusIcon/>New note</Button></div>
  <Card className="notice-bar"><InfoCircledIcon/><span>Your local content plan. Notes are not automatically sent to Substack.</span></Card>
  <Tabs variant="underline" size="sm" value={filter} onValueChange={setFilter} tabs={NOTE_TABS.map(t=>({value:t.id,label:<>{t.label}<span className="ticket-tab-count">{notes.filter(n=>t.id==="all"||n.status===t.id).length}</span></>}))}/>
  <div className="notes-grid">
   {notes.filter(n=>filter==="all"||n.status===filter).map(note=><Card className="note-card" key={note.id}>
    <header><span className="account-avatar">SS</span><div><strong>Sumit Sharma</strong><span>Substack Notes</span></div><Badge variant={note.status==="queued"?"info":"secondary"} className="ticket-badge"><span className="ticket-dot"/>{note.status==="queued"?"Planned":"Draft"}</Badge></header>
    <p>{note.body}</p>
    <Link href={`/editor/${note.articleId}`} className="note-source"><FileTextIcon/>{articles.find(a=>a.id===note.articleId)?.title||"Standalone note"}</Link>
    <footer><span><CalendarIcon/>{note.scheduledFor?new Date(note.scheduledFor).toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}):"No time set"}</span><Button variant="ghost" size="sm" onClick={()=>{setEditing(note);setOpen(true);}}>Edit <ArrowTopRightIcon/></Button></footer>
   </Card>)}
   <button className="new-note-card" onClick={add}><span><PlusIcon/></span><strong>A thought worth sharing?</strong><p>Give it a place in your queue.</p></button>
  </div>
  <Dialog open={open} onOpenChange={setOpen}><DialogContent className="modal-card">
   <DialogHeader className="p-0"><DialogTitle>A little note from you.</DialogTitle><DialogDescription className="muted-text">Keep it thoughtful. Keep it yours.</DialogDescription></DialogHeader>
   {editing&&<>
    <div className="field"><label htmlFor="note-body">Note</label><Textarea id="note-body" rows={5} maxLength={2000} value={editing.body} onChange={e=>setEditing({...editing,body:e.target.value})}/><span className="field-hint">{editing.body.length}/2000 characters</span></div>
    <div className="field">From article
     <Select value={editing.articleId||"none"} onValueChange={v=>setEditing({...editing,articleId:!v||v==="none"?"":v})} aria-label="From article" items={[{value:"none",label:"Standalone note"},...articles.map(a=>({value:a.id,label:a.title}))]}/>
    </div>
    <div className="field">Planned time<DateTimePicker value={editing.scheduledFor} onChange={v=>setEditing({...editing,scheduledFor:v})} label="Planned time"/></div>
    <div className="planned-checkbox"><Checkbox label="Add to planned queue" checked={editing.status==="queued"} onCheckedChange={checked=>setEditing({...editing,status:checked?"queued":"draft"})}/></div>
    <DialogFooter className="modal-actions"><Button variant="ghost" onClick={remove}>Delete note</Button><Button onClick={save}>Save note <CheckIcon/></Button></DialogFooter>
   </>}
  </DialogContent></Dialog>
 </div>;
}
export function SeoGraph(){
 const{articles}=useWorkspace();const[selected,setSelected]=useState(articles[0]?.id||"");const active=articles.find(a=>a.id===selected);const published=articles.filter(a=>a.canonicalUrl);
 return <div className="page">
  <div className="page-heading"><div><div className="heading-eyebrow">LET YOUR IDEAS FIND EACH OTHER</div><h1>Nothing good stands alone.</h1><p>Make your archive a connected body of work.</p></div><Button asChild variant="outline"><Link href="/connections"><ReloadIcon/>Import archive</Link></Button></div>
  <div className="seo-layout">
   <Card className="panel"><div className="section-heading"><div><h2>Your writing, connected.</h2><p>Explore internal linking opportunities.</p></div><Badge variant="outline" className="badge subtle-badge">LOCAL PREVIEW</Badge></div>
    <div className="archive-map"><div className="map-orbit orbit-one"/><div className="map-orbit orbit-two"/><div className="map-center"><Link2Icon/><span>Your archive</span><strong>{articles.length} ideas</strong></div>{articles.slice(0,6).map((a,i)=><button key={a.id} className={`map-node node-${i} ${selected===a.id?"selected":""}`} onClick={()=>setSelected(a.id)}><span><FileTextIcon/></span><strong>{a.title}</strong></button>)}</div>
    <p className="field-hint">Conceptual archive map. Connections are illustrative, not semantic similarity results.</p>
   </Card>
   <Card className="panel"><h2>{active?.title||"Select an article"}</h2><p className="muted-text">A quick health check for your next revision.</p>
    {active&&<><div className="seo-overview-score"><strong>{seoScore(active)}</strong><span>/100<br/>local SEO checklist</span></div><ul className="seo-checks">{seoChecks(active).map(c=><li key={c.label}><span className={c.passed?"check-pass":"check-pending"}>{c.passed?<CheckIcon/>:<PlusIcon/>}</span>{c.label}</li>)}</ul><Button asChild variant="outline"><Link href={`/editor/${active.id}`}>Improve this article <ArrowRightIcon/></Link></Button></>}
   </Card>
  </div>
  <Card className="panel keyword-panel">
   <div className="section-heading"><div><h2>Keyword &amp; canonical matrix</h2><p>Your own archive, not a competition.</p></div><span className="muted-text">{published.length} canonical URLs saved</span></div>
   <div className="article-table-wrap"><Table className="article-table"><TableHeader><TableRow><TableHead>Article</TableHead><TableHead>Target keyword</TableHead><TableHead>Canonical URL</TableHead><TableHead>Index status</TableHead></TableRow></TableHeader><TableBody>{articles.map(a=><TableRow key={a.id}><TableCell><Link href={`/editor/${a.id}`} className="matrix-title">{a.title}</Link></TableCell><TableCell><span className="keyword-chip">{a.keyword||"Not set"}</span></TableCell><TableCell>{safeUrl(a.canonicalUrl)?<a className="canonical-url" href={safeUrl(a.canonicalUrl)} target="_blank" rel="noopener noreferrer"><Link2Icon/>{new URL(a.canonicalUrl).pathname}<ArrowTopRightIcon/></a>:<span className="muted-text">Not set</span>}</TableCell><TableCell><span className="muted-text">Not verified</span></TableCell></TableRow>)}</TableBody></Table></div>
  </Card>
 </div>;
}
export function Connections(){
 const{reset}=useWorkspace();const[checking,setChecking]=useState(false);const[session,setSession]=useState<{substackConnected?:boolean;mediumConnected?:boolean}|null>(null);const[rss,setRss]=useState("");const[syncing,setSyncing]=useState(false);const[confirmReset,setConfirmReset]=useState(false);
 const check=async()=>{setChecking(true);try{setSession(await checkExtension());toast.success("Extension connection status refreshed.");}catch(e){toast.error(e instanceof Error?e.message:"Connection check failed");}finally{setChecking(false);}};
 const sync=async()=>{setSyncing(true);try{const response=await fetch("/api/rss/sync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rssUrl:rss})});const data=await response.json();if(!response.ok)throw new Error(data.error||"Import failed");toast.success(`Imported ${data.imported} articles to Supabase. Cloud archive is available through the API.`);}catch(e){toast.error(e instanceof Error?e.message:"RSS import failed");}finally{setSyncing(false);}};
 return <div className="page">
  <div className="page-heading"><div><div className="heading-eyebrow">A HOME BASE, NOT ANOTHER SILO</div><h1>Bring your world together.</h1><p>Your publications, your archive, your way of working.</p></div><Button variant="outline" onClick={check} disabled={checking}><ReloadIcon className={checking?"animate-spin":""}/>{checking?"Checking…":"Check extension"}</Button></div>
  <Card className="notice-bar"><InfoCircledIcon/><span>The dashboard currently saves in this browser. Configure keys to use authenticated cloud APIs.</span></Card>
  <div className="connections-grid">
   {[{name:"Substack",mark:"S",className:"substack",description:"Your essays, newsletters, and Notes. The first home for your original work.",connected:session?.substackConnected},{name:"Medium",mark:"M",className:"medium",description:"A new audience for your ideas, with your original canonical URL intact.",connected:session?.mediumConnected}].map(p=><Card className="panel connection-card" key={p.name}>
    <header><span className={`platform-icon platform-large ${p.className}`}><PlatformLogo platform={p.className==="substack"?"substack":"medium"}/></span><Badge variant="outline" className={cn("badge",p.connected?"verified-badge":"subtle-badge")}><span className={cn("dot",p.connected?"green":"muted")}/>{p.connected?"Session detected":"Not connected"}</Badge></header>
    <h2>{p.name}</h2><p>{p.description}</p>
    <div className="connection-detail"><span>Connection method</span><strong>Chrome extension bridge</strong></div>
    <Button variant="outline" onClick={check} disabled={checking}>Detect session <ArrowTopRightIcon/></Button>
   </Card>)}
   <Card className="panel connection-card">
    <header><span className="integration-symbol"><DownloadIcon/></span><Badge variant="outline" className="badge subtle-badge">SUPABASE</Badge></header>
    <h2>Your RSS archive</h2><p>Import public Substack or Medium feeds. Content is stored in your authenticated Supabase archive.</p>
    <label className="field">Feed URL<Input aria-label="Feed URL" type="url" value={rss} onChange={e=>setRss(e.target.value)} placeholder="https://you.substack.com/feed"/></label>
    <Button variant="outline" onClick={sync} disabled={!rss||syncing}>{syncing?"Importing…":"Import feed"}<ArrowRightIcon/></Button>
   </Card>
   <Card className="panel connection-card">
    <header><span className="integration-symbol"><LightningBoltIcon/></span><Badge variant="outline" className="badge subtle-badge">READ-ONLY</Badge></header>
    <h2>Claude / Cursor MCP</h2><p>An authenticated MCP endpoint exposes your cloud archive to compatible clients.</p>
    <label className="field">Server endpoint<Input aria-label="Server endpoint" value="/api/mcp" readOnly/></label>
    <p className="field-hint">Requires a Clerk bearer token. OAuth discovery and API-key issuance are not implemented.</p>
    <Button variant="outline" onClick={async()=>{try{await navigator.clipboard.writeText(`${window.location.origin}/api/mcp`);toast.success("Endpoint copied.");}catch{toast.error("Clipboard unavailable. Copy the endpoint manually.");}}}>Copy endpoint <Link2Icon/></Button>
   </Card>
  </div>
  <Card className="panel setup-panel"><div><h2>A few keys to make this yours.</h2><p>Copy <code>apps/web/.env.example</code> to <code>apps/web/.env.local</code>, then configure Clerk, Supabase, and OpenAI. Run the database migration in Supabase and enable Clerk third-party authentication.</p><p>For the bridge: run <code>npm run extension:build</code>, load <code>apps/extension/.output/chrome-mv3</code> in Chrome, and add its ID to your environment.</p></div><Badge variant="outline" className="badge subtle-badge">DEVELOPER SETUP</Badge></Card>
  <Card className="panel reset-panel"><div><h2>A fresh page.</h2><p>Reset this browser’s demo articles and notes. Export anything you want to keep first.</p></div><Button variant="outline" onClick={()=>setConfirmReset(true)}>Reset demo</Button></Card>
  <Dialog open={confirmReset} onOpenChange={setConfirmReset}><DialogContent className="modal-card"><DialogHeader className="p-0"><DialogTitle>Reset your local workspace?</DialogTitle><DialogDescription className="muted-text">Your browser’s articles and notes will be replaced with sample content. This cannot be undone.</DialogDescription></DialogHeader><DialogFooter className="modal-actions"><DialogClose asChild><Button variant="ghost">Keep my work</Button></DialogClose><Button onClick={()=>{reset();setConfirmReset(false);toast.success("Demo workspace reset.");}}>Reset workspace</Button></DialogFooter></DialogContent></Dialog>
 </div>;
}
export function Inspiration(){
 const router=useRouter();const{createArticle,updateArticle}=useWorkspace();
 const prompts=[
  {category:"Reflection",title:"What did you change your mind about?",body:"Think of a belief you once held confidently. What experience made you see it differently?",icon:LightningBoltIcon},
  {category:"Practical wisdom",title:"The advice you wish you’d received",body:"What have you learned the hard way that might make someone else’s path a little easier?",icon:BookmarkIcon},
  {category:"Observation",title:"Something ordinary, closely observed",body:"Find a small detail in your day that you usually overlook. Stay with it. What does it reveal?",icon:EyeOpenIcon},
  {category:"A useful question",title:"What would you do less of?",body:"Not everything deserves your attention. Write about something you have decided to let go of.",icon:ChatBubbleIcon}
 ];
 return <div className="page">
  <div className="page-heading"><div><div className="heading-eyebrow">GOOD QUESTIONS MAKE GOOD BEGINNINGS</div><h1>Follow a little curiosity.</h1><p>No trending topics. Just a place to start thinking.</p></div></div>
  <div className="inspiration-quote"><span>“</span><blockquote>You don’t have to see the whole staircase.<br/>Just write the next sentence.</blockquote><p>A small reminder from your workspace.</p></div>
  <div className="inspiration-grid">{prompts.map(({icon:Icon,...p})=><Card className="panel inspiration-card" key={p.title}><Icon/><span className="eyebrow">{p.category}</span><h2>{p.title}</h2><p>{p.body}</p><Button variant="ghost" onClick={()=>{const id=createArticle();updateArticle(id,{title:p.title,markdown:p.body+"\n\n"});router.push(`/editor/${id}`);}}>Start with this <ArrowRightIcon/></Button></Card>)}</div>
 </div>;
}
