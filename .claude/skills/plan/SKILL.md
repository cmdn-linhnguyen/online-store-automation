---
name: plan
description: Plan automated tests for a screen/feature of online-store-web BEFORE writing any test code. Must read the real online-store-web source (routes/web.php, the Vue Page component, childComponents, related Vuex store) to get accurate, up-to-date details — docs/test-plan.md is only a high-level overview/roadmap, not detailed enough and can be stale. Always use this skill when the user wants to write a new test, extend coverage for a screen/route, or before running /write-test — even if the user doesn't literally type "plan".
---

# Plan — plan tests before writing code

Goal: produce an accurate scenario checklist grounded in the REAL behavior of `online-store-web`,
so `/write-test` only has to implement instead of guessing how the UI works.

**Key principle:** `docs/test-plan.md` in this repo is a snapshot written at one point in time — it
tells you which route is which priority and gives a suggested starting checklist, but it is NOT the
source of truth for current UI detail. `online-store-web` is live source code that may have changed
since the doc was written. Investigating the real source is therefore **mandatory**, not optional.

## Steps

### 1. Identify scope
Determine which route/screen the user wants to plan for (e.g. `/search`, product detail, review
list...), or a bug/feature description. If unclear, ask rather than guess.

### 2. Read `docs/test-plan.md` for a starting point
Check the relevant entry: priority (P0/P1/P2), whether auth is required, suggested scenario
checklist. Treat this as guidance on scope/priority — not yet something to write tests from.

### 3. Investigate the real `online-store-web` source (mandatory, never skip)
The `online-store-web` repo lives at `../online-store-web` (sibling directory). For the route being
planned:

- Find the route in `../online-store-web/routes/web.php` — path, route name, controller method.
- Find the corresponding Vue Page component in `../online-store-web/resources/js/Pages/**` — read
  the **whole** relevant part (not just the first few dozen lines), including any
  `childComponents/`, `views/`, `partials/` actually used by the feature being planned.
- Check the related Vuex store module in `../online-store-web/resources/js/store/modules/` if any,
  to understand state that drives the UI (loading, error, disabled, retry...).
- Note down: whether CSS class names are stable, whether `data-testid` exists, the real displayed
  text (for accurate locators/assertions instead of guessing), and the show/hide conditions of each
  element (by category, login state, feature flag...).
- If the scope is large (many files/childComponents), use the Agent tool with
  `subagent_type: Explore` to read in parallel — but always synthesize the result yourself, don't
  just copy the agent's output verbatim.

### 4. Cross-check existing automation
Read `tests/pages/`, `tests/pages/components/`, `tests/e2e/` to see what Page Object/Component
Object/spec already exists for this area — avoid duplicating. If a suitable shared Component Object
already exists (sidebar filter, product list, pagination, sort, breadcrumbs...), the plan must state
it will be reused.

### 5. Compile the checklist
List scenarios like:

```
- [ ] <scenario description> — priority: P0/P1/P2 — auth: yes/no — needs separate mobile case: yes/no
```

Cover: happy path, edge cases (empty state, API error, boundary data), responsive differences
(desktop/mobile if behavior differs), auth-gated cases (if any). For each scenario, state which
Page Object/Component Object needs to be created or extended, and which test-data needs to be added
to `tests/test-data/`.

If `docs/test-plan.md` turns out to be wrong/incomplete relative to the real source (route changed,
component renamed, new feature missing from the doc...), call this out in a separate "Discrepancies
vs docs/test-plan.md" section of the plan.

### 6. Present & get approval
Present the checklist concisely, use `EnterPlanMode` so the user approves it before `/write-test` is
allowed to run. Do NOT write test code at this stage.

### 7. After approval
If step 5 surfaced discrepancies with `docs/test-plan.md`, ask the user whether to update that file
now (to prevent it from drifting further) or leave it for later.
