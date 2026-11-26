<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## KanaMori architecture
- The app is a front-end-only interactive prototype: all user progress lives in `src/lib/app-store.tsx` (React context + localStorage); pure rules (streak, XP, levels, spaced repetition) live in `src/lib/progress.ts` and `src/lib/srs.ts` with tests in `src/test/progress.test.ts` — keeps rules testable and swappable for a real backend later.
- Every screen renders inside the phone frame in `__root.tsx` (`#app-scroll` scroller, `#app-overlay` for sheets); bottom sheets must use `components/kana/sheet.tsx` so they stay inside the frame on desktop.
- Tab screens live under the pathless `_tabs` layout (bottom nav); full-screen flows (lesson, review session, auth, study list) are top-level routes.
- The profile level (`scriptsForLevel` in `src/lib/progress.ts`) is the single source for which scripts appear in Aprender, Revisão and stats; `reviewQueue` in `src/data/kana.ts` builds the review from those scripts — never hardcode script lists in screens.
- Character content (kana, kanji, mnemonics, PT-BR copy) lives in `src/data/kana.ts`; items without an illustration fall back to emoji on a tone color.
