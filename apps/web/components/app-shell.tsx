"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { LayoutDashboard, FileText, MessageSquare, Share2, Zap, Link as LinkIcon, Search, Plus, CircleHelp, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Command, CommandInput, CommandList, CommandGroup, CommandItem, CommandEmpty } from "@/components/ui/command";
import { useWorkspace } from "@/components/workspace-provider";
import { cn } from "@/lib/utils";

const navigation=[
 {href:"/",label:"Overview",short:"Overview",icon:LayoutDashboard},
 {href:"/articles",label:"Articles",short:"Articles",icon:FileText},
 {href:"/notes-queue",label:"Notes queue",short:"Notes queue",icon:MessageSquare},
 {href:"/seo-graph",label:"SEO & internal links",short:"SEO graph",icon:Share2},
 {href:"/inspiration",label:"Inspiration",short:"Inspiration",icon:Zap},
 {href:"/connections",label:"Platform connections",short:"Connections",icon:LinkIcon}
];
export function BrandMark({small=false}:{small?:boolean}) {
 return <span className={cn("brand-mark",small&&"brand-mark-small")} aria-hidden="true"><span/><span/><span/></span>;
}
export function AppShell({children}:{children:React.ReactNode}) {
 const pathname=usePathname();const router=useRouter();const{articles,createArticle}=useWorkspace();
 const[command,setCommand]=useState(false);const[menu,setMenu]=useState(false);const[help,setHelp]=useState(false);
 useEffect(()=>{
  const listener=(event:KeyboardEvent)=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){event.preventDefault();setCommand(v=>!v);}};
  window.addEventListener("keydown",listener);return()=>window.removeEventListener("keydown",listener);
 },[]);
 useEffect(()=>{setMenu(false);},[pathname]);
 const go=(href:string)=>{setCommand(false);setMenu(false);router.push(href);};
 const isActive=(href:string)=>pathname===href||(href==="/articles"&&pathname.startsWith("/editor"));
 const current=navigation.find(n=>n.href===pathname)?.short||"Article editor";

 return <div className="app-shell sidebarless-shell">
  <a className="skip-link" href="#main">Skip to content</a>
  <div className="workspace-main">
   <header className="topbar shell-topbar">
    <Link href="/articles" className="brand shell-brand" aria-label="Polar Publish home"><BrandMark/><span>polar<span className="brand-light">publish</span></span></Link>
    <nav className="header-navigation" aria-label="Main navigation">{navigation.map(({href,label,short,icon:Icon})=>
     <Link key={href} href={href} aria-label={label} aria-current={isActive(href)?"page":undefined} className={cn("header-nav-link",isActive(href)&&"active")}><Icon/>{short}</Link>
    )}</nav>
    <div className="compact-navigation"><Button variant="ghost" size="icon" aria-label="Open navigation" onClick={()=>setMenu(true)}><Menu/></Button><span className="compact-page-name">{current}</span></div>
    <div className="topbar-right shell-header-actions">
     <span className="demo-label"><span className="dot amber"/>Local demo</span>
     <Button variant="ghost" size="icon" onClick={()=>setCommand(true)} aria-label="Open command menu"><Search/></Button>
     <Button variant="ghost" size="icon" onClick={()=>setHelp(true)} aria-label="Help & getting started"><CircleHelp/></Button>
     {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?<><SignedIn><UserButton/></SignedIn><SignedOut><SignInButton><Button variant="secondary" size="sm">Sign in</Button></SignInButton></SignedOut></>:<Link href="/connections" aria-label="Workspace settings" className="account-avatar top-avatar">SS</Link>}
    </div>
   </header>
   <main id="main">{children}</main>
   <footer className="workspace-footer"><span><BrandMark small/>A little less busywork. A lot more writing.</span><span>Built for your next good idea.</span></footer>
  </div>
  <Dialog open={menu} onOpenChange={setMenu}><DialogContent className="modal-card navigation-dialog"><DialogTitle>Workspace navigation</DialogTitle><DialogDescription className="sr-only">Choose a workspace page.</DialogDescription>
   <nav className="navigation-popup-links" aria-label="Workspace pages">{navigation.map(({href,label,icon:Icon})=><Link key={href} href={href} aria-current={isActive(href)?"page":undefined} onClick={()=>setMenu(false)}><Icon/>{label}</Link>)}</nav>
  </DialogContent></Dialog>
  <Dialog open={command} onOpenChange={setCommand}><DialogContent className="command-dialog p-0 gap-0 [&>button]:hidden"><DialogTitle className="sr-only">Quick search</DialogTitle><DialogDescription className="sr-only">Search your articles or navigate your workspace.</DialogDescription>
   <Command className="bg-transparent" label="Search articles and pages"><CommandInput aria-label="Search articles and pages" placeholder="Where would you like to go?"/><CommandList className="command-results max-h-[55dvh]"><CommandEmpty>No matching articles or pages.</CommandEmpty><CommandGroup><CommandItem value="Create a new article" onSelect={()=>go(`/editor/${createArticle()}`)}><Plus/><span>Create a new article</span></CommandItem></CommandGroup><CommandGroup heading="Workspace">{navigation.map(n=><CommandItem key={n.href} value={n.label} onSelect={()=>go(n.href)}><n.icon/><span>{n.label}</span></CommandItem>)}</CommandGroup><CommandGroup heading="Articles">{articles.map(a=><CommandItem key={a.id} value={a.title} onSelect={()=>go(`/editor/${a.id}`)}><FileText/><span>{a.title}</span></CommandItem>)}</CommandGroup></CommandList></Command>
   <div className="command-footer">Search your ideas, not your browser tabs. <kbd>Esc to close</kbd></div>
  </DialogContent></Dialog>
  <Dialog open={help} onOpenChange={setHelp}><DialogContent className="modal-card"><DialogTitle>Welcome to your writing workspace.</DialogTitle><DialogDescription className="muted-text">This is a local-first preview. Articles and notes are stored in this browser, not published or synced automatically.</DialogDescription><ol className="help-steps"><li>Open an article or create a new draft.</li><li>Write in Markdown and use the inspector to check SEO.</li><li>Insert a paywall to preview your free and paid sections.</li><li>Configure integrations on Platform connections to enable authenticated APIs.</li></ol><DialogClose asChild><Button>Got it</Button></DialogClose></DialogContent></Dialog>
 </div>;
}
