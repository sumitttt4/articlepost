"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { initialArticles, initialNotes, type Article, type Note } from "@/lib/content";
interface Workspace { articles: Article[]; notes: Note[]; ready: boolean; updateArticle: (id: string, patch: Partial<Article>) => void; createArticle: () => string; removeArticle: (id: string) => void; setNotes: (notes: Note[]) => void; reset: () => void }
const Context = createContext<Workspace | null>(null);
const storageSchema = z.object({
 articles: z.array(z.object({ id: z.string(), title: z.string(), subtitle: z.string(), markdown: z.string(), keyword: z.string(), canonicalUrl: z.string(), status: z.enum(["draft", "queued", "published", "canonical_waiting"]), category: z.string(), updatedAt: z.string(), schedule: z.string().optional(), waitForIndex: z.boolean() })),
 notes: z.array(z.object({ id: z.string(), articleId: z.string(), body: z.string(), scheduledFor: z.string(), status: z.enum(["draft", "queued"]) }))
});
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
 const [articles, setArticles] = useState<Article[]>(initialArticles);
 const [notes, setNotes] = useState<Note[]>(initialNotes);
 const [ready, setReady] = useState(false);
 useEffect(() => {
 try { const raw = localStorage.getItem("polar-workspace-v1"); if (raw) { const saved = storageSchema.parse(JSON.parse(raw)); setArticles(saved.articles); setNotes(saved.notes); } }
 catch { toast.error("Saved workspace could not be read. Showing sample articles instead."); }
 setReady(true);
 }, []);
 useEffect(() => { if (ready) { try { localStorage.setItem("polar-workspace-v1", JSON.stringify({ articles, notes })); } catch { toast.error("Browser storage is full or unavailable. Export your drafts before leaving."); } } }, [articles, notes, ready]);
 const updateArticle = useCallback((id: string, patch: Partial<Article>) => setArticles(items => items.map(a => a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a)), []);
 const createArticle = () => { const id = crypto.randomUUID(); setArticles(items => [{ id, title: "Untitled article", subtitle: "", markdown: "", keyword: "", canonicalUrl: "", status: "draft", category: "Uncategorized", updatedAt: new Date().toISOString(), waitForIndex: true }, ...items]); return id; };
 return <Context.Provider value={{ articles, notes, ready, updateArticle, createArticle, setNotes, removeArticle: id => setArticles(items => items.filter(a => a.id !== id)), reset: () => { setArticles(initialArticles); setNotes(initialNotes); } }}>{children}</Context.Provider>;
}
export function useWorkspace() { const value = useContext(Context); if (!value) throw new Error("WorkspaceProvider is required"); return value; }
