# online-store-automation

Playwright + TypeScript E2E automation for `online-store-web` (Starbucks Japan Online Store —
Laravel + Inertia.js + Vue3, source lives in the sibling directory `../online-store-web`).

## Standard workflow (use these 5 skills in order)

```
/plan   →   /write-test   →   /summarize-test   →   /review-test   →   /create-pr
```

1. **`/plan`** — always run before writing tests for a new screen/feature. Reads the real
   `online-store-web` source (route, Page component, child components) instead of relying only on
   `docs/test-plan.md`. Ends with Plan Mode so a reviewer approves the checklist before any code.
2. **`/write-test`** — implements Page Object / Component Object / spec from the approved checklist,
   self-runs typecheck/lint/test before reporting done.
3. **`/summarize-test`** — right after `/write-test` reports done, summarize the test cases just
   implemented (scenario + main expectation per test) into `docs/test-cases/<feature>.md` — updating
   the matching section in place if that feature already has a doc — so the user can verify coverage
   without reading Playwright code. Run this automatically, don't wait to be asked.
4. **`/review-test`** — reviews the test diff against a Playwright-specific checklist (flakiness,
   locators, assertions, convention) — different from a generic code review.
5. **`/create-pr`** — runs the quality gate (typecheck, lint, test:smoke) then opens a PR from a
   standard template.

`docs/test-plan.md` is a **high-level overview/roadmap** (route → priority → suggested checklist),
**not the final source of detail** — actual UI behavior must come from the `online-store-web`
source, since it can change after the doc was written.

## Structure & conventions

```
src/config/env.ts        # env loading & validation (zod)
src/utils/test-tags.ts    # @smoke / @regression tags
tests/fixtures/           # test.extend fixtures (e.g. test-base.ts)
tests/pages/              # Page Object — one file per screen
tests/pages/components/   # shared Component Objects across pages (sidebar filter, product list,
                           # pagination, sort, breadcrumbs...) — CHECK this folder before writing a
                           # new Page Object, to avoid duplicating logic
tests/test-data/          # static data (*.data.ts), don't hardcode strings in specs
tests/e2e/<feature>/      # spec files, mirror the feature names used in docs/test-plan.md
```

- **Path aliases** (tsconfig): `@config/*`, `@fixtures/*`, `@pages/*`, `@test-data/*`, `@utils/*` —
  always import via alias, never long relative paths.
- **Tags**: every `test.describe`/`test` must carry `@smoke` (core flow, always fast) or
  `@regression` (everything else) — see `src/utils/test-tags.ts`.
- **Locators**: prefer `data-testid` / `getByRole` / stable text over CSS classes generated from
  styling (they break easily on CSS refactors).
- **Never** use `page.waitForTimeout` — use `expect(...)` (auto-retrying) or `page.waitForURL`.
- Tests must be **independent**: no dependency on run order or data created by other tests.
- Run per environment: `pnpm test:local` / `pnpm test:stg` / `pnpm test:prod` (see `README.md`).

## References

- `docs/test-plan.md` — route → page → priority table + per-screen scenario checklist.
- `docs/test-cases/<feature>.md` — human-readable test case summaries per feature, generated/updated
  by `/summarize-test` right after `/write-test`.
- `../online-store-web/routes/web.php` — actual routes.
- `../online-store-web/resources/js/Pages/**` — actual Page components + childComponents.
- `../online-store-web/resources/js/store/modules/**` — Vuex store, for understanding state that
  drives UI (loading/error/disabled...).
