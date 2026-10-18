"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus as PlusIcon, ArrowRight as ArrowRightIcon, ArrowUpRight as ArrowTopRightIcon, Search as MagnifyingGlassIcon, Rows3 as RowsIcon, LayoutGrid as GridIcon, FileText as FileTextIcon, Check as CheckIcon, Clock as ClockIcon, Link as Link2Icon, BookOpen as ReaderIcon, MessageSquare as ChatBubbleIcon } from "lucide-react";
import { PlatformLogo } from "@/components/platform-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@cloudflare/kumo/components/select";
import { Tabs } from "@cloudflare/kumo/components/tabs";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useWorkspace } from "@/components/workspace-provider";
import { seoScore, wordCount, type ArticleStatus, type Article } from "@/lib/content";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: ArticleStatus }) {
 const variants = { draft:"secondary", published:"success", queued:"info", canonical_waiting:"warning" } as const;
 return <Badge variant={variants[status]} className={`ticket-badge ticket-${status}`}><span className="ticket-dot" />{{ draft:"Draft",published:"Published",queued:"Scheduled",canonical_waiting:"Canonical waiting" }[status]}</Badge>;
}
export function Score({ article }: { article: Article }) {
 const score=seoScore(article);
 return <Badge variant={score>=75?"success":score>=50?"warning":"error"} className="ticket-score"><span className="score-bars"><i/><i/><i/></span>{score}<span className="score-max">/100</span></Badge>;
}
export function Library({ overview=false }: { overview?:boolean }) {
 const {articles,notes,createArticle,ready}=useWorkspace();const router=useRouter();
 const [tab,setTab]=useState("all");const [query,setQuery]=useState("");const [grid,setGrid]=useState(false);const [sort,setSort]=useState("updated");const [category,setCategory]=useState("all");
 useEffect(()=>{
  const listener=(event:KeyboardEvent)=>{const target=event.target as HTMLElement;if(event.key==="/"&&!event.ctrlKey&&!event.metaKey&&!["INPUT","TEXTAREA","SELECT"].includes(target.tagName)&&!target.isContentEditable){event.preventDefault();document.querySelector<HTMLInputElement>('input[aria-label="Search articles"]')?.focus();}};
  window.addEventListener("keydown",listener);return()=>window.removeEventListener("keydown",listener);
 },[]);
 const counts={all:articles.length,published:articles.filter(a=>a.status==="published").length,canonical_waiting:articles.filter(a=>a.status==="canonical_waiting").length,draft:articles.filter(a=>a.status==="draft").length};
 const visible=articles.filter(a=>(tab==="all"||a.status===tab)&&a.title.toLowerCase().includes(query.toLowerCase())&&(category==="all"||a.category===category)).sort((a,b)=>sort==="title"?a.title.localeCompare(b.title):sort==="score"?seoScore(b)-seoScore(a):Date.parse(b.updatedAt)-Date.parse(a.updatedAt));
 const add=()=>router.push(`/editor/${createArticle()}`);
 return <div className="page library-page">
  <div className="page-heading"><div><div className="heading-eyebrow">A HOME FOR YOUR IDEAS</div><h1>{overview?"Good things start with a draft.":"Your words, everywhere."}</h1><p>Write once. Adapt thoughtfully. Reach further.</p></div><Button onClick={add}><PlusIcon/>New article</Button></div>
  <Card className="stats-grid gap-0 py-0">
   {[
    {label:"Total articles",value:articles.length,icon:FileTextIcon,detail:`${counts.draft} ideas taking shape`,accent:false},
    {label:"Published",value:counts.published,icon:ReaderIcon,detail:"Out in the world",accent:true},
    {label:"Awaiting canonical",value:counts.canonical_waiting,icon:Link2Icon,detail:"Protecting your original work",accent:false},
    {label:"Notes in queue",value:notes.filter(n=>n.status==="queued").length,icon:ChatBubbleIcon,detail:"Little ideas, ready to travel",accent:false}
   ].map(s=><CardContent className="stat" key={s.label}><div className="stat-top"><span>{s.label}</span><s.icon/></div><strong>{String(s.value).padStart(2,"0")}</strong><small className={s.accent?"text-emerald-400":""}>{s.accent&&<span className="dot green"/>}{s.detail}</small></CardContent>)}
  </Card>
  <Card className="distribution-panel gap-0 py-0" aria-label="Distribution workflow">
   <CardHeader className="distribution-intro flex-row space-y-0"><span className="flow-icon"><Link2Icon/></span><div><strong>Your ideas have a journey.</strong><span>Original first. Everywhere else, with care.</span></div><Badge variant="outline" className="badge subtle-badge">CANONICAL CASCADE</Badge></CardHeader>
   <CardContent className="cascade-flow">
    <div className="flow-step"><span className="platform-icon substack"><PlatformLogo platform="substack"/></span><div><strong>Publish on Substack</strong><span>Your original, at home</span></div><CheckIcon className="text-emerald-400"/></div><ArrowRightIcon className="flow-arrow"/>
    <div className="flow-step"><span className="google-mark"><PlatformLogo platform="google"/></span><div><strong>Google index check</strong><span>Wait for your canonical</span></div><ClockIcon className="text-amber-400"/></div><ArrowRightIcon className="flow-arrow"/>
    <div className="flow-step"><span className="platform-icon medium"><PlatformLogo platform="medium"/></span><div><strong>Adapt for Medium</strong><span>Linked to the original</span></div><Link2Icon/></div><ArrowRightIcon className="flow-arrow"/>
    <div className="flow-step"><span className="notes-flow-icon"><ChatBubbleIcon/></span><div><strong>Share as Notes</strong><span>Small sparks of a big idea</span></div></div>
   </CardContent>
   <div className="cascade-footnote"><span className="dot amber"/>Workflow preview · scheduling and index verification are not running in demo mode.<Link href="/connections">Set up integrations <ArrowTopRightIcon/></Link></div>
  </Card>
  <section className="article-section">
   <div className="section-heading"><div><h2>Long-form library <Badge variant="secondary" className="nav-count">{articles.length}</Badge></h2><p>A growing collection of things worth saying.</p></div>
    <ToggleGroup type="single" value={grid?"grid":"list"} onValueChange={v=>{if(v)setGrid(v==="grid");}} className="view-toggle" aria-label="Article view">
     <ToggleGroupItem value="list" className={!grid?"selected":""} aria-label="List view"><RowsIcon/></ToggleGroupItem><ToggleGroupItem value="grid" className={grid?"selected":""} aria-label="Grid view"><GridIcon/></ToggleGroupItem>
    </ToggleGroup>
   </div>
   <Tabs variant="underline" size="sm" value={tab} onValueChange={setTab} className="kumo-library-tabs"
    tabs={[{id:"all",label:"All articles"},{id:"published",label:"Published"},{id:"canonical_waiting",label:"Canonical waiting"},{id:"draft",label:"Drafts"}].map(t=>({value:t.id,label:<>{t.label}<span className="ticket-tab-count">{counts[t.id as keyof typeof counts]}</span></>}))}/>
   <div className="table-tools">
    <label className="search-field"><MagnifyingGlassIcon/><Input aria-label="Search articles" placeholder="Search your articles…" value={query} onChange={e=>setQuery(e.target.value)}/><kbd>/</kbd></label>
    <div className="table-tool-actions">
      <Select value={category} onValueChange={v=>setCategory(v??"all")} aria-label="Filter by category" size="sm" className="kumo-category-select" items={[{value:"all",label:"All categories"},...Array.from(new Set(articles.map(a=>a.category))).map(c=>({value:c,label:c}))]}/>
      <Select value={sort} onValueChange={v=>setSort(v??"updated")} aria-label="Sort articles" size="sm" items={{updated:"Last updated",title:"Title",score:"SEO score"}}/>
    </div>
   </div>
   {!ready?<Skeleton className="h-72 w-full"/>:visible.length===0?<div className="empty-state"><FileTextIcon/><h3>{query||category!=="all"?"No matching ideas. Yet.":"A little space for your next idea."}</h3><p>{query?"Try a different search or clear your filters.":"Every good article begins with a first sentence."}</p><Button variant="outline" onClick={()=>{if(query||category!=="all"||tab!=="all"){setQuery("");setCategory("all");setTab("all");}else add();}}>{query||category!=="all"||tab!=="all"?"Clear filters":"New article"}</Button></div>:grid?
    <div className="article-grid">{visible.map(a=><Card key={a.id} className="article-card"><Link href={`/editor/${a.id}`}><div className="flex items-center justify-between"><StatusBadge status={a.status}/><ArrowTopRightIcon/></div><h3>{a.title}</h3><p>{a.subtitle}</p><footer><span>{a.category}</span><Score article={a}/></footer></Link></Card>)}</div>:
    <div className="article-table-wrap"><Table className="article-table library-table"><TableHeader><TableRow><TableHead>Article</TableHead><TableHead>Status</TableHead><TableHead>SEO score</TableHead><TableHead>Distribution</TableHead><TableHead>Updated</TableHead><TableHead><span className="sr-only">Open</span></TableHead></TableRow></TableHeader><TableBody>{visible.map(a=><TableRow key={a.id}>
     <TableCell><Link href={`/editor/${a.id}`} className="article-title-link"><span className={`article-glyph glyph-${a.status}`}><FileTextIcon/></span><span><strong>{a.title}</strong><small>{a.category}<span>·</span>{wordCount(a.markdown)} words<span>·</span>{Math.max(1,Math.ceil(wordCount(a.markdown)/220))} min read</small></span></Link></TableCell>
     <TableCell><StatusBadge status={a.status}/></TableCell><TableCell><Score article={a}/></TableCell>
     <TableCell><div className="distribution-icons"><span className={cn("mini-platform",a.status!=="draft"&&"mini-substack")} title="Substack"><PlatformLogo platform="substack"/></span><span className={cn("mini-platform",a.status==="published"&&"mini-medium")} title="Medium"><PlatformLogo platform="medium"/></span><span className={cn("mini-platform",a.status==="published"&&"mini-notes")} title="Notes"><ChatBubbleIcon/></span>{a.canonicalUrl&&<span className="canonical-mark" title="Canonical URL saved, not verified"><Link2Icon/></span>}</div></TableCell>
     <TableCell className="date-cell">{new Date(a.updatedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",timeZone:"UTC"})}</TableCell><TableCell><Button asChild variant="ghost" size="icon" className="row-open"><Link href={`/editor/${a.id}`} aria-label={`Open ${a.title}`}><ArrowTopRightIcon/></Link></Button></TableCell>
    </TableRow>)}</TableBody></Table></div>
   }
   <div className="table-footer"><span>Showing {visible.length} of {articles.length} articles</span><span><span className="dot muted"/>Sample content · saved in this browser</span></div>
  </section>
  <Card className="writing-nudge flex-row py-4"><span className="nudge-icon"><FileTextIcon/></span><div><strong>The next good idea is already yours.</strong><span>Give it a place to begin.</span></div><Button variant="ghost" onClick={add}>Start a draft <ArrowRightIcon/></Button></Card>
 </div>;
}
