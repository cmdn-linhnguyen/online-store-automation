---
name: summarize-test
description: Summarize the test cases just implemented into a concise, human-readable markdown doc under docs/test-cases/ (grouped by describe block, one row per test with scenario + main expectation) so the user can verify coverage without reading raw Playwright code. If a doc already covers the same feature, update the matching section in place instead of creating a new file. Always run this right after /write-test finishes (typecheck/lint/test all green) — before /review-test — and whenever the user asks to "tóm tắt test case" / summarize or get an overview of a spec file to verify.
---

# Summarize Test — human-readable test case doc

Goal: after `/write-test` finishes, produce a scannable, plain-language record of exactly what was
tested, saved under `docs/`, so the user can verify coverage without reading Playwright code line by
line — and so the doc keeps accumulating across sessions instead of being lost in chat history.

## When to run

- Automatically as the last step after `/write-test` reports done (typecheck/lint/test all green) —
  don't wait for the user to ask.
- Whenever the user asks to summarize/tóm tắt test cases, or wants an overview of a spec file to
  verify.

## Scope

Default to the spec file(s) just changed in this session (the files `/write-test` touched). If the
user names a specific file/path instead, summarize that.

## Output location

- Doc lives at `docs/test-cases/<feature>.md`, where `<feature>` is the top-level folder name under
  `tests/e2e/` (e.g. `tests/e2e/search/sidebar.spec.ts` → `docs/test-cases/search.md`). This mirrors
  how `docs/test-plan.md` and `tests/e2e/<feature>/` are already organized by feature, not by spec
  file — a feature folder can contain several spec files (sidebar.spec.ts, sort.spec.ts,
  pagination.spec.ts...) that all belong in the same doc.
- Inside the doc, one `##` section per spec file (e.g. `## sidebar.spec.ts`), each with its own
  table(s) grouped by describe block.

## Steps

### 1. Find the right file before creating a new one
- List `docs/test-cases/` (it may not exist yet — that's fine, this is establishing the convention).
- If `docs/test-cases/<feature>.md` already exists, **read it fully** first.
  - If it already has a section for this exact spec file, **replace that section in place** (the
    spec file's tests may have changed — don't leave stale rows alongside new ones).
  - If it covers the same feature but this is a new spec file, **append a new `##` section** to the
    existing doc — don't create a second file for the same feature.
- Only create a brand-new `docs/test-cases/<feature>.md` if no doc for that feature exists yet.
- If a spec file's feature folder doesn't map cleanly (rare), ask rather than guess where it belongs.

### 2. Read the spec file(s) in full
Read every `test(...)` and `test.describe(...)` block directly from the file — don't rely on memory
from earlier in the conversation, the file may have changed since (e.g. after `/review-test` fixes).

### 3. Group by describe block
Mirror the file's own grouping (e.g. desktop / mobile / applied filter tags) — don't invent new
groupings, and keep the file's own order.

### 4. For each test case, extract two things
- **Kịch bản (scenario)**: what the test actually does, in plain language — the sequence of actions
  (which page/section/filter, what's clicked, in what order) — not a restatement of the test title.
- **Kỳ vọng chính (main expectation)**: the assertion(s) that actually matter — what would fail if
  the underlying feature broke. Skip incidental or lint-driven assertions that only duplicate an
  earlier, more precise check in the same test (e.g. a trailing `expect(page).toHaveURL(...)` added
  just to satisfy `playwright/expect-expect`).
- One row per test. Dense enough to scan in one pass, not a step-by-step transcript.

### 5. Flag anything worth double-checking (short notes below the table, not inline per row)
- Depends on live/external data (aggregation counts, catalog contents, real env) rather than fixed
  fixtures or mocks.
- Deliberately narrows scope vs. the original `/plan` checklist (e.g. dropped a combination due to
  flakiness risk) — say why in one line.
- Was only verified against a live/shared environment, if that affects how much to trust the result.

### 6. Write/update the file
- Use `Write` for a brand-new doc, `Edit` for updating an existing one (replace the matching section
  wholesale rather than patching individual rows).
- Keep a one-line doc header: which spec file(s), last-updated date if the repo already tracks dates
  elsewhere, otherwise omit rather than guess a date.
- After writing, reply in chat with a short pointer (path + one-line summary of what changed) — don't
  paste the full table again in the chat message, the user can open the file.

## What NOT to do

- Don't paste raw code blocks from the spec — the point is a plain-language summary, not a code dump.
- Don't re-run tests or re-review code as part of this skill — that's `/write-test`'s and
  `/review-test`'s job. This only summarizes what's already there and already passing.
- Don't invent test cases that aren't in the file — if coverage looks thin against the plan, say so
  plainly instead of padding the summary.
- Don't create a second doc for a feature that already has one — always check `docs/test-cases/`
  first.
