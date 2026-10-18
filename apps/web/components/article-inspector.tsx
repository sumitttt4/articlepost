"use client";
import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Check as CheckIcon, Plus as PlusIcon, WandSparkles as MagicWandIcon, Link as Link2Icon, ArrowRight as ArrowRightIcon, Info as InfoCircledIcon } from "lucide-react";
import { PlatformLogo } from "@/components/platform-logo";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DateTimePicker } from "@/components/date-time-picker";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useWorkspace } from "@/components/workspace-provider";
import { PAYWALL, seoChecks, seoScore, slugify, safeUrl, type Article } from "@/lib/content";
import { adaptLocally, type Adapted } from "@/lib/adapt";

export function ArticleInspector({article,adapted,update,insert}:{article:Article;adapted:Adapted|null;update:(patch:Partial<Article>)=>void;insert:(text:string)=>void}){
 const{articles,notes,setNotes}=useWorkspace();const[platform,setPlatform]=useState("substack");
 const checks=seoChecks(article);const score=seoScore(article);
 const freePreview=adapted??adaptLocally({title:article.title,rawMarkdown:article.markdown||" ",targetKeyword:article.keyword,canonicalUrl:article.canonicalUrl,archiveLinks:[]});
 return <aside className="inspector"><Tabs defaultValue="seo"><TabsList className="inspector-tabs" aria-label="Article inspector"><TabsTrigger value="seo">SEO & GEO</TabsTrigger><TabsTrigger value="links">Internal links</TabsTrigger><TabsTrigger value="previews">Previews</TabsTrigger><TabsTrigger value="cascade">Cascade</TabsTrigger></TabsList>
  <TabsContent value="seo" className="inspector-content">
   <div className="inspector-heading"><div><h2>A little easier to discover.</h2><p>Good writing deserves to be found.</p></div><span className="large-score">{score}<small>/100</small></span></div><div className="progress-track"><span style={{width:`${score}%`}}/></div><span className="field-hint">Local heuristic score, not a ranking prediction.</span>
   <label className="field">Target keyword<Input aria-label="Target keyword" value={article.keyword} onChange={e=>update({keyword:e.target.value})} placeholder="What is this article really about?"/></label>
   <div className="inspector-section"><h3>Search preview <span>GOOGLE</span></h3><Card className="serp-preview"><div><span className="serp-favicon">S</span><span>Sumit’s publication<small>{safeUrl(article.canonicalUrl)?new URL(article.canonicalUrl).hostname:"your-publication.substack.com"}</small></span></div><span className="serp-title">{article.title||"Your article title"}</span><p>{article.subtitle||"A concise, useful description helps readers decide if your article answers their question."}</p><span className="serp-slug">/{slugify(article.title)}</span></Card></div>
   <div className="inspector-section"><h3>Answer engine readiness<span>{checks.filter(c=>c.passed).length}/{checks.length}</span></h3><ul className="seo-checks">{checks.map(c=><li key={c.label}><span className={c.passed?"check-pass":"check-pending"}>{c.passed?<CheckIcon/>:<PlusIcon/>}</span>{c.label}</li>)}</ul></div><Card className="inspector-note"><MagicWandIcon/><p>Write for people first.<br/><span>Clear questions and honest answers help search engines, too.</span></p></Card>
  </TabsContent>
  <TabsContent value="links" className="inspector-content"><h2>Your archive is a conversation.</h2><p className="muted-text">Connect this idea to things you’ve already written. Demo suggestions use title and keyword overlap, not vectors.</p><div className="archive-links">{articles.filter(a=>a.id!==article.id&&safeUrl(a.canonicalUrl)).sort((a,b)=>Number(b.keyword.split(" ").some(w=>article.markdown.toLowerCase().includes(w.toLowerCase())))-Number(a.keyword.split(" ").some(w=>article.markdown.toLowerCase().includes(w.toLowerCase())))).map(a=><Card className="archive-link" key={a.id}><span className="link-document"><Link2Icon/></span><span><strong>{a.title}</strong><small>{a.category} · From your archive</small></span><Button variant="outline" size="sm" onClick={()=>{insert(`[${a.title}](${safeUrl(a.canonicalUrl)})`);toast.success("Internal link inserted into your draft.");}}><PlusIcon/>Insert</Button></Card>)}</div><Link href="/connections" className="text-link">Import your RSS archive <ArrowRightIcon/></Link></TabsContent>
  <TabsContent value="previews" className="inspector-content"><h2>Same idea. A different home.</h2><p className="muted-text">Review each version before sharing.</p><ToggleGroup type="single" value={platform} onValueChange={p=>{if(p)setPlatform(p);}} className="segmented-control">{["substack","medium","notes"].map(p=><ToggleGroupItem value={p} key={p} className={platform===p?"selected":""}>{p==="notes"?"Notes":p[0].toUpperCase()+p.slice(1)}</ToggleGroupItem>)}</ToggleGroup>
   {platform==="notes"?<div className="notes-preview">{freePreview.substackNotes.map((note,i)=><Card key={i}><span className="eyebrow">NOTE {i+1}</span><p>{note}</p><Button variant="ghost" size="sm" onClick={()=>{setNotes([...notes,{id:crypto.randomUUID(),articleId:article.id,body:note,scheduledFor:"",status:"draft"}]);toast.success("Added to Notes queue as a draft.");}}>Add to queue <PlusIcon/></Button></Card>)}</div>:<Card className="platform-preview"><Badge variant="outline" className={platform==="medium"?"badge medium-badge":"badge substack-badge"}>{platform==="medium"?"Medium · free section only":"Substack · full article"}</Badge><h3>{article.title}</h3>{platform==="medium"&&<div className="canonical-preview"><Link2Icon/>Canonical: {safeUrl(article.canonicalUrl)||"Not set"}</div>}<div className="prose-article"><ReactMarkdown>{platform==="medium"?freePreview.mediumMarkdown:article.markdown.replace(PAYWALL,"\n\n> Paid subscribers continue below.\n\n")}</ReactMarkdown></div></Card>}
   <p className="field-hint">{adapted?"Adaptation ready for review.":"Offline extract preview. Use Adapt article for an AI rewrite when configured."}</p>
  </TabsContent>
  <TabsContent value="cascade" className="inspector-content"><h2>Protect the original.</h2><p className="muted-text">Let your own publication be the first home for your work.</p><label className="field">Original canonical URL<Input aria-label="Original canonical URL" type="url" value={article.canonicalUrl} onChange={e=>update({canonicalUrl:e.target.value})} placeholder="https://your-publication.com/p/article"/></label>{article.canonicalUrl&&!safeUrl(article.canonicalUrl)&&<p className="field-error">Enter a valid http or https URL.</p>}
   <div className="switch-row"><div><strong>Wait for Google indexing</strong><p>Keep secondary destinations on hold until verified.</p></div><Switch className="switch" checked={article.waitForIndex} onCheckedChange={checked=>update({waitForIndex:checked})} aria-label="Wait for Google indexing"/></div>
   <div className="field"><label htmlFor="planned-publication-time">Planned publication time</label><DateTimePicker id="planned-publication-time" value={article.schedule||""} onChange={v=>update({schedule:v})} label="Planned publication time" placeholder="Not planned yet"/><span className="field-hint">Your browser’s local timezone.</span></div>
   <div className="cascade-inspector"><div><span className="platform-icon substack"><PlatformLogo platform="substack"/></span><span>Original on Substack<small>Publish first</small></span></div><div><span className="google-mark"><PlatformLogo platform="google"/></span><span>Index verification<small>{article.waitForIndex?"Manual verification required":"Index wait disabled"}</small></span></div><div><span className="platform-icon medium"><PlatformLogo platform="medium"/></span><span>Medium + canonical<small>{article.canonicalUrl?"URL saved, not yet verified":"Add original URL first"}</small></span></div></div>
   <Card className="inspector-note"><InfoCircledIcon/><p>Planning only in this preview.<br/><span>No background scheduler or Google verification is active. Nothing publishes automatically.</span></p></Card>
  </TabsContent>
 </Tabs></aside>;
}
