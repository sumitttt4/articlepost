# Before enabling live integrations

## Local preview QA

- Search, status tabs, category filters, both layouts, and sort controls.
- New article, reload persistence, Markdown export, formatting at the caret.
- Paywall at the start, middle, end, and absent; paid text must never appear in public variants.
- All inspector tabs, Notes creation/edit/delete, local queue planning.
- Cmd/Ctrl+K, Escape, focus trapping, keyboard-only navigation.
- Narrow viewport navigation; reduced-motion and reduced-transparency preferences.
- Unknown article IDs, empty search results, denied clipboard/storage, absent extension.

## Cloud integration QA (requires real credentials)

- Use two Clerk accounts. Verify each can read/update only its own rows in all four tables.
- Attempt to add a destination to another writer's article. RLS must reject it.
- Verify unauthenticated API calls fail. Do not use a service-role key to mask RLS mistakes.
- Test malformed, over-limit, redirected, and entity-bearing RSS feeds.
- Verify provider timeout, invalid JSON, missing API keys, and quota errors show useful messages.
- Verify embeddings are 1536-dimensional and `match_archive` never returns another writer's rows.
- Explicitly test AI behavior with malicious instructions embedded in article source.
- Migrate local drafts to account-scoped cloud persistence only after user consent; clear account state on sign-out.
- Replace the in-memory limiter with a shared production limiter; set spend caps and error monitoring.

## Publishing and canonical safety (not yet implemented)

- Validate platform draft endpoints and CSRF behavior against current documented/observed platform behavior.
- Add destination-specific document conversion; never send Markdown as if it were a platform JSON document.
- Require the writer to confirm title, free/paid boundary, destination, and canonical URL before a draft handoff.
- Confirm server-side canonical metadata after saving, rather than trusting an echoed request field.
- Never export session cookies to the web app, Supabase, logs, or MCP.
- Add durable idempotent jobs, retries, per-destination status, cancellation, and timezone/DST handling.
- Integrate GSC with proper authorization; never mark a page indexed on the basis of a timer.
- Gate distribution on actual verified indexing when the writer enables that option.
- Add an exact production-origin allowlist to both the extension manifest and message handler.

The checked-in extension intentionally rejects `PUBLISH_POST` until these requirements are met.
