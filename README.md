# Polar Publish

A Polar-inspired dark publishing workspace built with **Next.js 15, TypeScript, Tailwind CSS, shadcn-style owned components, Radix, Clerk, Supabase/pgvector, and WXT**.

## Run locally

Requires Node.js 22.12+ and npm.

```sh
npm install
npm run dev
```

Open **http://localhost:3000**. No credentials are needed for the browser-only demo. Sample content is labeled, drafts and Notes persist in localStorage, and nothing is actually published or scheduled.

```sh
npm test                 # Content, paywall, input and RSS safety tests
npm run typecheck        # Web and extension TypeScript
npm run build            # Production web build
npm run extension:build  # Chrome MV3 extension
```

## Screens

- `/` — workspace overview
- `/articles` — searchable, filterable library, list/grid layouts, computed SEO scores
- `/editor/[id]` — Markdown editor, selection-aware formatting, `/paywall`, rendered preview, live SEO checklist, internal links, platform previews, local schedule planning, Markdown export
- `/notes-queue` — create, edit, delete, and plan Notes
- `/seo-graph` — illustrative archive map and keyword/canonical matrix
- `/connections` — extension session detection, RSS import, setup details, demo reset
- `/inspiration` — prompts that create actual editable drafts

Cmd/Ctrl+K opens workspace search. The interface supports mobile navigation, keyboard focus, reduced motion, and reduced transparency.

## Cloud API setup

1. Copy `apps/web/.env.example` to `apps/web/.env.local`.
2. Add Clerk publishable and secret keys. Configure your Clerk application for your deployment domain.
3. Create a Supabase project. Enable **Clerk third-party authentication** so Supabase verifies Clerk session tokens. The RLS policies use `auth.jwt()->>'sub'` (Clerk IDs are text, not UUIDs).
4. Run `packages/db/migrations/0001_initial.sql` in Supabase SQL Editor on a new project. The migration is one-time, not idempotent.
5. Set the Supabase URL and anon key. **Never place a service-role key in the browser.**
6. Set `OPENAI_API_KEY` for AI adaptation and archive embeddings. `OPENAI_MODEL` is optional.
7. Restart the web server.

### Important boundaries

**The dashboard remains local-first even when keys are supplied.** Cloud article CRUD, RSS import, archive search, and MCP are separately usable authenticated APIs; automatic cloud hydration/sync is not wired into the UI. Imported feeds are accessible through `/api/archive`, not automatically merged with local demo articles. This avoids silently uploading private drafts or mixing accounts.

| Endpoint | Purpose |
| --- | --- |
| `GET /api/articles` | List owned cloud drafts |
| `POST /api/articles` | Create cloud draft (`title`, `raw_markdown`, optional `subtitle`, `target_keyword`, `canonical_url`, `status`) |
| `PATCH /api/articles/[uuid]` | Update owned cloud draft |
| `POST /api/ai/adapt` | AI Medium variant + 5 Notes + SEO metadata |
| `POST /api/rss/sync` | Import `{ rssUrl }` from HTTPS Substack/Medium feeds |
| `GET /api/archive` | List owned archive entries |
| `POST /api/archive/match` | Semantic search with `{ text }` |
| `POST /api/mcp` | Minimal read-only MCP JSON transport |

AI input: `{ title, rawMarkdown, paywallIndex?, targetKeyword, canonicalUrl, archiveLinks: [{ title, url }] }`. The earliest paywall marker/index is applied **before** any content goes to the AI provider. Paid text is excluded from both Medium and Notes generation. Offline preview is explicitly an extract, not AI writing. SEO scores are checklist heuristics, not promises about rankings.

RSS imports are limited to 50 entries and 2 MB, have a timeout, reject redirects and XML entity declarations, and accept only HTTPS `*.substack.com`, `medium.com`, and `*.medium.com`. Custom-domain feeds need a hardened allowlist/proxy before enabling. At most 20 entries get embeddings per import; without an OpenAI key they import without vectors. RPC searches enforce RLS.

The included limiter is **per-process only**. Replace it with a shared Redis/database-backed limiter before scaling. Add provider budgets, observability, and production integration tests. Upstream content may contain sensitive data; obtain consent before sending it to OpenAI.

## Chrome extension

```sh
npm run extension:build
```

1. Go to `chrome://extensions`, enable Developer mode, and choose **Load unpacked**.
2. Select `apps/extension/.output/chrome-mv3`.
3. Set `NEXT_PUBLIC_EXTENSION_ID` to Chrome's extension ID in the web environment and restart Next.js.
4. Sign in to your publications in Chrome, then click **Check extension** on Connections.

The bridge only sends session-presence booleans, never cookie values. Cookie presence is not proof a server-side session is still valid. Both manifest external matches and background sender checks are restricted to `http://localhost:3000`. To deploy, add the exact production origin to **both**; do not use wildcard production origins.

`PUBLISH_POST` currently **fails closed with an explicit unsupported response**. Private Substack/Medium draft APIs, CSRF requirements, document formats, canonical fields, and per-user consent must be validated before implementing automatic draft creation. No live publishing, GSC index polling, worker scheduler, or automatic canonical verification is included. Export Markdown and review on each platform for now.

## MCP

Stateless JSON-RPC POST supports `initialize`, `ping`, `tools/list`, `tools/call` (`search_archive`), and notification acknowledgments. Authentication uses a valid Clerk session bearer token. OAuth discovery, API-key issuance, SSE/resumption, and full client interoperability are not implemented. Do not present this as a public unauthenticated MCP server.

## Structure

```text
apps/web/          Next.js app, components, APIs, tests
apps/extension/    WXT MV3 session bridge and popup
packages/db/      SQL migration with ownership RLS and vector matching
```

The dark design uses `#09090B` canvas, `#111114` surfaces, hairline borders, Inter, Newsreader editorial previews, and JetBrains Mono metadata. Fonts use `next/font`; the first production build requires access to Google Fonts. No affiliation with Polar.sh is implied.
