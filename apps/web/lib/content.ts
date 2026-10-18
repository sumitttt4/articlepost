export const PAYWALL = "---PAYWALL---";
export type ArticleStatus = "draft" | "queued" | "published" | "canonical_waiting";
export interface Article {
 id: string; title: string; subtitle: string; markdown: string; keyword: string;
 canonicalUrl: string; status: ArticleStatus; category: string; updatedAt: string;
 schedule?: string; waitForIndex: boolean;
}
export interface Note { id: string; articleId: string; body: string; scheduledFor: string; status: "draft" | "queued" }
export const initialArticles: Article[] = [
 { id: "quiet-work", title: "The quiet advantage of doing less", subtitle: "Why the most meaningful work happens when we stop optimizing everything.", keyword: "intentional productivity", category: "Productivity", status: "canonical_waiting", canonicalUrl: "https://example.substack.com/p/the-quiet-advantage", updatedAt: "2026-10-17T08:30:00Z", waitForIndex: true,
 markdown: "There is a particular kind of exhaustion that comes not from doing too much, but from doing too many things that don’t matter.\n\nWe have become extraordinarily good at being busy. Less good at asking what the busyness is for.\n\n## What is intentional productivity?\n\nIntentional productivity means choosing the work that matters before finding ways to do it faster. It is a practice of subtraction, not acceleration.\n\nThe best work rarely arrives in the space between meetings. It needs an unhurried stretch of attention, and permission to look unproductive for a while.\n\n## How can you make room for deeper work?\n\nStart with one hour. No notifications, no elaborate system, no new app. Just a single question worth sitting with.\n\n- Choose one meaningful outcome for the day.\n- Make your first hour a quiet one.\n- Leave a little space between commitments.\n\n---PAYWALL---\n\n## A weekly practice for doing less\n\nEvery Friday, write down the three things that made a genuine difference. Then look at everything else on your calendar. What would happen if you simply stopped?\n\nThe goal is not an empty calendar. It is a calendar that reflects what you actually care about.\n\n## Frequently asked questions\n\n### Does doing less mean achieving less?\n\nNot necessarily. Reducing low-value commitments can create the conditions for higher-quality work." },
 { id: "audience", title: "Build a body of work, not an audience", subtitle: "A different way to think about showing up online.", keyword: "body of work", category: "Writing", status: "published", canonicalUrl: "https://example.substack.com/p/body-of-work", updatedAt: "2026-10-16T12:00:00Z", waitForIndex: true, markdown: "The internet asks you to build an audience. I think you should build a body of work instead.\n\n## What makes a body of work valuable?\n\nAn audience is something you borrow. A body of work is something you own. Every essay is another room in a house you are building slowly.\n\n## How do you start?\n\nMake something useful. Share it with care. Do it again next week." },
 { id: "attention", title: "Your attention is not a renewable resource", subtitle: "On protecting the one thing you can’t get back.", keyword: "attention economy", category: "Mindful living", status: "queued", canonicalUrl: "", updatedAt: "2026-10-15T09:00:00Z", schedule: "2026-10-20T09:00", waitForIndex: true, markdown: "We talk about spending attention as if it were money. But money can be earned again.\n\n## Why does attention matter?\n\nYour attention shapes what you notice. What you notice shapes your life. Protecting it is not selfish; it is necessary.\n\n## How can you protect your attention?\n\nCreate boundaries around the tools that compete for it. Start with your morning." },
 { id: "slow-internet", title: "A case for a slower internet", subtitle: "More gardens. Fewer feeds.", keyword: "slow internet", category: "Culture", status: "draft", canonicalUrl: "", updatedAt: "2026-10-14T16:00:00Z", waitForIndex: true, markdown: "I miss the internet that felt like a collection of places, not a single endless room.\n\n## What would a slower internet look like?\n\nSmall websites. Thoughtful newsletters. Links from one person to another. An internet you visit with intention, then leave." },
 { id: "creative-rest", title: "Rest is part of the creative process", subtitle: "The ideas that arrive when you stop looking.", keyword: "creative rest", category: "Creativity", status: "published", canonicalUrl: "https://example.substack.com/p/creative-rest", updatedAt: "2026-10-12T10:00:00Z", waitForIndex: true, markdown: "Every interesting idea I have had began as something I noticed when I was supposed to be doing something else.\n\n## Why is rest important for creativity?\n\nRest gives unrelated thoughts time to find each other. A walk is not a break from the work. Sometimes it is the work." },
 { id: "small-things", title: "The small things are the whole thing", subtitle: "A note on paying closer attention.", keyword: "everyday creativity", category: "Personal essay", status: "draft", canonicalUrl: "", updatedAt: "2026-10-11T11:00:00Z", waitForIndex: true, markdown: "A well-made cup of coffee. An unhurried conversation. A sentence that says exactly what you mean.\n\nWe keep waiting for the big moments. But a life is mostly made of small ones." }
];
export const initialNotes: Note[] = [
 { id: "n1", articleId: "quiet-work", body: "We have become extraordinarily good at being busy. Less good at asking what the busyness is for.", scheduledFor: "2026-10-20T10:00", status: "queued" },
 { id: "n2", articleId: "audience", body: "An audience is something you borrow. A body of work is something you own. Build the thing you get to keep.", scheduledFor: "2026-10-20T14:00", status: "queued" },
 { id: "n3", articleId: "creative-rest", body: "A walk is not a break from the work. Sometimes it is the work.", scheduledFor: "2026-10-21T09:00", status: "draft" }
];
export function wordCount(markdown: string) { return markdown.trim().split(/\s+/).filter(Boolean).length; }
export function slugify(value: string) { return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
export function seoChecks(article: Pick<Article, "title" | "markdown" | "keyword" | "subtitle">) {
 const keyword = article.keyword.toLowerCase().trim();
 return [
 { label: "A clear, descriptive title", passed: article.title.length >= 15 && article.title.length <= 65 },
 { label: "Target keyword in the article", passed: !!keyword && article.markdown.toLowerCase().includes(keyword) },
 { label: "Question-based H2 headings", passed: /^## .+\?/m.test(article.markdown) },
 { label: "A direct answer near the beginning", passed: article.markdown.slice(0, 800).split(/[.!?]/).some(s => /\b(is|means|refers to)\b/i.test(s)) },
 { label: "FAQ section for answer engines", passed: /## .*frequently asked|## .*faq/i.test(article.markdown) },
 { label: "Contextual internal links", passed: /\[[^\]]+\]\(https?:\/\//.test(article.markdown) },
 { label: "Meta description (50–160 characters)", passed: article.subtitle.length >= 50 && article.subtitle.length <= 160 },
 { label: "At least 300 words of useful content", passed: wordCount(article.markdown) >= 300 }
 ];
}
export function seoScore(article: Pick<Article, "title" | "markdown" | "keyword" | "subtitle">) { return Math.round(seoChecks(article).filter(c => c.passed).length / 8 * 100); }
export function safeUrl(value: string) { try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? url.href : ""; } catch { return ""; } }
