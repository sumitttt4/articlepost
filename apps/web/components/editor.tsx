"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ArrowLeft as ArrowLeftIcon, Check as CheckIcon, WandSparkles as MagicWandIcon, Bold as FontBoldIcon, Italic as FontItalicIcon, Link as Link2Icon, List as ListBulletIcon, LockKeyhole as LockClosedIcon, Download as DownloadIcon, Calendar as CalendarIcon, Eye as EyeOpenIcon, Pencil as Pencil1Icon, Info as InfoCircledIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip } from "@cloudflare/kumo/components/tooltip";
import { useWorkspace } from "@/components/workspace-provider";
import { PAYWALL, wordCount, slugify, safeUrl } from "@/lib/content";
import { adaptLocally, type Adapted } from "@/lib/adapt";
import { StatusBadge } from "@/components/library";
import { ArticleInspector } from "@/components/article-inspector";
import { DateTimePicker } from "@/components/date-time-picker";

export function Editor({id}:{id:string}){
 const{articles,ready,updateArticle}=useWorkspace();const article=articles.find(a=>a.id===id);
 const textarea=useRef<HTMLTextAreaElement>(null);
 const[preview,setPreview]=useState(false);const[adapted,setAdapted]=useState<Adapted|null>(null);const[busy,setBusy]=useState(false);const[scheduleOpen,setScheduleOpen]=useState(false);const[date,setDate]=useState("");
 if(!ready)return <div className="page"><Skeleton className="h-96 w-full"/></div>;
 if(!article)return <div className="empty-state"><h1>This draft isn’t in your workspace.</h1><p>It may have been removed or saved in another browser.</p><Button asChild><Link href="/articles">Back to articles</Link></Button></div>;
 const update=(patch:Parameters<typeof updateArticle>[1])=>{updateArticle(id,patch);if(patch.markdown!==undefined||patch.title!==undefined||patch.canonicalUrl!==undefined||patch.keyword!==undefined)setAdapted(null);};
 const insert=(before:string,after="")=>{
  const el=textarea.current;const start=el?.selectionStart??article.markdown.length;const end=el?.selectionEnd??start;
  update({markdown:article.markdown.slice(0,start)+before+article.markdown.slice(start,end)+after+article.markdown.slice(end)});setPreview(false);
  requestAnimationFrame(()=>{textarea.current?.focus();textarea.current?.setSelectionRange(start+before.length,end+before.length);});
 };
 const generate=async()=>{
  if(!article.markdown.trim()){toast.error("Write a little first, then adapt your article.");return;}setBusy(true);
  const input={title:article.title,rawMarkdown:article.markdown,targetKeyword:article.keyword,canonicalUrl:article.canonicalUrl,archiveLinks:articles.filter(a=>a.id!==id&&safeUrl(a.canonicalUrl)).map(a=>({title:a.title,url:a.canonicalUrl}))};
  try{if(!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY){setAdapted(adaptLocally(input));toast.info("Offline adaptation prepared. This is an extract, not an AI rewrite.");}else{const response=await fetch("/api/ai/adapt",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(input)});const data=await response.json();if(!response.ok)throw new Error(data.error||"Could not adapt this article");setAdapted(data);toast.success("Platform variants are ready to review.");}}
  catch(error){toast.error(error instanceof Error?error.message:"Adaptation failed. Try again.");}finally{setBusy(false);}
 };
 const download=()=>{const url=URL.createObjectURL(new Blob([`# ${article.title}\n\n${article.subtitle}\n\n${article.markdown}`],{type:"text/markdown"}));const a=document.createElement("a");a.href=url;a.download=`${slugify(article.title)||"draft"}.md`;a.click();URL.revokeObjectURL(url);toast.success("Markdown exported.");};
 const tools=[{name:"Bold",icon:FontBoldIcon,run:()=>insert("**","**")},{name:"Italic",icon:FontItalicIcon,run:()=>insert("_","_")},{name:"Insert link",icon:Link2Icon,run:()=>insert("[","](https://example.com)")},{name:"Insert list",icon:ListBulletIcon,run:()=>insert("\n- ")}];
 return <div className="editor-page">
  <div className="editor-top"><div><Link href="/articles" className="back-link"><ArrowLeftIcon/>Library</Link><span className="topbar-divider"/><StatusBadge status={article.status}/><span className="autosave"><CheckIcon/>Saved locally</span></div><div><Button variant="ghost" size="sm" onClick={download}><DownloadIcon/><span className="hide-small">Export</span></Button><Button variant="outline" size="sm" onClick={generate} disabled={busy}><MagicWandIcon/>{busy?"Adapting…":"Adapt article"}</Button><Button size="sm" onClick={()=>{setDate(article.schedule||"");setScheduleOpen(true);}}><CalendarIcon/>Schedule</Button></div></div>
  <div className="editor-split">
   <section className="writing-column">
    <div className="writing-meta"><span>MASTER DRAFT</span><ToggleGroup type="single" value={preview?"preview":"write"} onValueChange={v=>{if(v)setPreview(v==="preview");}}><ToggleGroupItem value="write" className={!preview?"selected":""}><Pencil1Icon/>Write</ToggleGroupItem><ToggleGroupItem value="preview" className={preview?"selected":""}><EyeOpenIcon/>Preview</ToggleGroupItem></ToggleGroup></div>
    <div className="editor-paper">
     <label className="sr-only" htmlFor="article-title">Article title</label><Textarea id="article-title" className="title-input" rows={2} value={article.title} onChange={e=>update({title:e.target.value})} placeholder="A title worth opening…"/>
     <label className="sr-only" htmlFor="article-subtitle">Article subtitle</label><Textarea id="article-subtitle" className="subtitle-input" rows={2} value={article.subtitle} onChange={e=>update({subtitle:e.target.value})} placeholder="Give your reader a reason to stay."/>
     <div className="author-line"><span className="account-avatar">SS</span><div><strong>Sumit Sharma</strong><span>{Math.max(1,Math.ceil(wordCount(article.markdown)/220))} min read · Master article</span></div></div>
     <div className="format-toolbar" role="toolbar" aria-label="Markdown formatting">
      {tools.map(tool=><Tooltip key={tool.name} content={tool.name}><Button variant="ghost" size="icon" aria-label={tool.name} onClick={tool.run}><tool.icon/></Button></Tooltip>)}
      <Button variant="ghost" size="sm" aria-label="Insert heading" onClick={()=>insert("\n\n## ")}>H2</Button><span/>
      <Button variant="ghost" size="sm" className="paywall-tool" onClick={()=>{if(article.markdown.includes(PAYWALL))toast.info("Your article already has a paywall boundary.");else insert(`\n\n${PAYWALL}\n\n`);}}><LockClosedIcon/>Paywall</Button><span className="toolbar-hint">Markdown supported</span>
     </div>
     {preview?<div className="prose-article">{article.markdown.split(PAYWALL).map((part,i)=><div key={i}>{i>0&&<div className="paywall-divider"><LockClosedIcon/>SUBSTACK PAYWALL BOUNDARY<span>Paid subscribers only</span></div>}<ReactMarkdown>{part}</ReactMarkdown></div>)}</div>:<>
      <label className="sr-only" htmlFor="article-body">Article body in Markdown</label><Textarea ref={textarea} id="article-body" className="body-editor" value={article.markdown} onChange={e=>{let value=e.target.value;if(value.includes("/paywall")&&!value.includes(PAYWALL))value=value.replace("/paywall",`\n${PAYWALL}\n`);update({markdown:value});}} placeholder="Start with the thought you can’t stop thinking about…" spellCheck/>
      <div className="editor-tip"><InfoCircledIcon/>Type <code>/paywall</code> to separate free and paid content.</div>
     </>}
    </div>
    <div className="editor-bottom"><span>{wordCount(article.markdown)} words<span>·</span>{article.markdown.length} characters</span><span><span className="dot green"/>Stored in this browser</span></div>
   </section>
   <ArticleInspector article={article} adapted={adapted} update={update} insert={insert}/>
  </div>
  <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}><DialogContent className="modal-card"><DialogTitle>Make room for your next article.</DialogTitle><DialogDescription className="muted-text">Save a planned time in your local queue. This does not schedule a live publication.</DialogDescription><div className="field"><label htmlFor="publication-time">Publication time</label><DateTimePicker id="publication-time" value={date} onChange={setDate} label="Publication time" placeholder="Pick a date and time"/></div><DialogFooter className="modal-actions"><DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose><Button onClick={()=>{if(!date||new Date(date).getTime()<=Date.now()){toast.error("Choose a future date and time.");return;}update({schedule:date,status:"queued"});setScheduleOpen(false);toast.success("Added to your local publication plan.");}}>Save plan <CalendarIcon/></Button></DialogFooter></DialogContent></Dialog>
 </div>;
}
