import { z } from "zod";
import { PAYWALL, safeUrl, seoScore, slugify } from "./content";
export const adaptInput = z.object({
 title: z.string().trim().min(1).max(300), rawMarkdown: z.string().min(1).max(100000),
 paywallIndex: z.number().int().min(0).nullable().optional(), targetKeyword: z.string().max(200).default(""),
 canonicalUrl: z.string().max(2000).default(""),
 archiveLinks: z.array(z.object({ title: z.string().max(300), url: z.string().url().max(2000) })).max(20).default([])
}).superRefine((data, ctx) => { if (data.paywallIndex != null && data.paywallIndex > data.rawMarkdown.length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["paywallIndex"], message: "Paywall index exceeds article length" }); if (data.canonicalUrl && !safeUrl(data.canonicalUrl)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["canonicalUrl"], message: "Canonical URL must use http or https" }); });
export const adaptedOutput = z.object({ seoScore: z.number().min(0).max(100), seoTitle: z.string().min(1), seoSlug: z.string().min(1), seoDescription: z.string(), mediumTags: z.array(z.string()).length(5), mediumMarkdown: z.string(), substackNotes: z.array(z.string()).length(5) });
export type AdaptInput = z.infer<typeof adaptInput>;
export type Adapted = z.infer<typeof adaptedOutput>;
export function freeSection(input: Pick<AdaptInput, "rawMarkdown" | "paywallIndex">) {
 const marker = input.rawMarkdown.indexOf(PAYWALL);
 const end = Math.min(marker >= 0 ? marker : input.rawMarkdown.length, input.paywallIndex ?? input.rawMarkdown.length);
 return { markdown: input.rawMarkdown.slice(0, end).trim(), hasPaywall: marker >= 0 || input.paywallIndex != null };
}
export function teaser(canonical: string) { const url = safeUrl(canonical); return url ? `\n\n> **There’s more to this story.**\n> [Read the full essay and support independent writing](${url.replace(/\)/g,"%29")}).` : "\n\n> **There’s more to this story.**\n> Add your original article URL to link readers to the full essay."; }
// Offline helper, not an AI rewrite. It never sends the paid section to an adapter.
export function adaptLocally(input: AdaptInput): Adapted {
 const free = freeSection(input);
 const clean = free.markdown.replace(/^(?:happy \w+|hello subscribers|hey friends|dear readers)[^\n]*\n+/i, "");
 const paragraphs = clean.split(/\n\s*\n/).filter(p => !p.startsWith("#") && p.length > 35).map(p => p.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_`]/g, "").trim());
 const notes = Array.from({ length: 5 }, (_, i) => (paragraphs[i % Math.max(1, paragraphs.length)] || input.title).slice(0, 480));
 const description = clean.replace(/[#*`\[\]]/g, "").replace(/\s+/g, " ").slice(0, 155);
 return { seoScore: seoScore({ title: input.title, markdown: clean, keyword: input.targetKeyword, subtitle: description }), seoTitle: input.title.slice(0, 65), seoSlug: slugify(input.title), seoDescription: description, mediumTags: [input.targetKeyword || "Writing", "Ideas", "Creativity", "Personal Growth", "Essays"], mediumMarkdown: clean + (free.hasPaywall ? teaser(input.canonicalUrl) : ""), substackNotes: notes };
}
