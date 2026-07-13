---
name: write-test
description: Write Playwright tests (Page Object, shared Component Object, test-data, spec) for online-store-automation, following this repo's conventions (path aliases, @smoke/@regression tags, test.step, no hard sleeps). Use right after a checklist from /plan has been approved, or when the user describes a specific scenario clearly enough to implement directly. Always self-run typecheck/lint/test after writing before reporting done.
---

# Write Test — implement the approved plan

## Before writing

- If there's no clear checklist from `/plan` yet and the user hasn't described enough detail
  (locators, expected behavior), suggest running `/plan` first instead of guessing how the UI works.
- Read `CLAUDE.md` for repo conventions (aliases, tags, folder structure) if not already in context.
- Check `tests/pages/components/` for a suitable shared Component Object (sidebar filter, product
  list, pagination, sort, breadcrumbs...) — if the feature reuses UI that already has a Component
  Object, compose it, don't copy the locator/logic into a new Page Object.

## Mandatory coding rules

- **Locators**: prefer `data-testid` > `getByRole`/stable text > CSS class. Avoid selecting by a
  class generated from styling (brittle across CSS/SCSS refactors).
- **Aliases**: import via `@fixtures/*`, `@pages/*`, `@test-data/*`, `@utils/*`, `@config/*` — never
  long relative paths (`../../../`).
- **Tags**: every `test.describe` carries `${testTags.smoke}` or `${testTags.regression}` depending
  on impact (P0 → smoke, rest → regression, per the priority set in `/plan`).
- **Test structure**: use `test.step` to break a long test into clear steps; put assertions inside
  Page Object `expectXxx()` methods rather than scattering `expect()` calls in the spec when reusable.
- **Never** use `page.waitForTimeout`/hard sleeps. Use `expect(...).toHaveURL/toBeVisible/...`
  (auto-retrying) or `page.waitForURL` when waiting on navigation.
- **Test-data**: static values (labels, product codes, discount codes...) go in
  `tests/test-data/*.data.ts`, don't hardcode repeated strings in specs.
- **Independence**: no test depends on run order or data created by another test. Auth-required
  tests use a dedicated fixture (e.g. `authenticatedPage`), not manual login repeated per test.
- File naming: `tests/e2e/<feature>/<scenario>.spec.ts`, `tests/pages/<feature>.page.ts`.

## After writing

1. Run `pnpm typecheck` and `pnpm lint` — fix all errors before reporting done.
2. Run the spec file just created/changed (e.g. `pnpm test tests/e2e/<feature>/<scenario>.spec.ts`)
   — if it fails, debug it (use `pnpm test:headed`/`pnpm test:debug` if needed) before reporting
   done; never report "done" while the test is red.
3. If `docs/test-plan.md` has a matching checklist item, check it off `[x]` for the completed
   scenario.
4. Report concisely: files created/changed (with paths), tags assigned, test run result.
5. Then run `/summarize-test` on the spec file(s) just written — don't wait to be asked.
