---
name: review-test
description: Review Playwright test code (Page Object, Component Object, spec, fixture, test-data) in online-store-automation against a Playwright-specific checklist — flakiness, locator/assertion quality, repo conventions — different from a generic code review. Use when the user wants to review a test diff just written, review an automation PR, or as a mandatory step before /create-pr.
---

# Review Test — a Playwright-specific checklist

Don't use a generic code-review checklist — test automation has failure modes (flakiness, brittle
locators) that ordinary code review doesn't catch.

## Scope

Default to the current working diff (`git diff`) unless the user specifies otherwise. If the user
gives a PR link, use `gh pr diff`/`gh pr view` to get the content.

## Checklist

For each changed test/Page Object file, check:

1. **Flaky patterns**
   - Any `page.waitForTimeout`/hard sleep → always a blocking finding.
   - Any hand-rolled retry loop or `expect(...).toPass()` used where Playwright's built-in auto-wait
     would already suffice (not a bug, but should be simplified if redundant).
   - Does the test depend on run order or data created by another test/prior run?

2. **Locators**
   - Selecting by a CSS class generated from styling (breaks on CSS refactor) instead of
     `data-testid`/role/stable text?
   - Locator too broad (may match the wrong element) or too tied to fine-grained DOM structure
     (breaks on small markup changes)?

3. **Assertions**
   - Any assertion that only checks `toBeVisible()` when content/URL/state also needs checking
     (weak assertion — the test could pass despite wrong behavior)?
   - Do assertions verify what the scenario actually requires (cross-check against
     `docs/test-plan.md` or the `/plan` checklist if available)?

4. **Repo conventions** (see `CLAUDE.md`)
   - Imports use aliases (`@pages`, `@fixtures`, `@test-data`, `@utils`) instead of long relative
     paths?
   - Tags (`@smoke`/`@regression`) match the actual impact level?
   - Any logic duplicated from `tests/pages/components/*` instead of reused?
   - Does the Page Object leak complex business assertions where it shouldn't, or does the spec use
     raw locators instead of calling through the Page Object?

5. **Coverage**
   - Cross-check the reviewed scenarios against `docs/test-plan.md`/the approved plan — any scenario
     in the plan still not implemented?

## How to report

List findings by severity, prioritizing findings backed by concrete evidence (quote the line, state
the input/behavior that would make the test flaky or pass incorrectly):

- **Blocking**: hard sleeps, wrong/missing assertions that let the test pass despite a real bug,
  tests that depend on each other and become flaky under parallel runs.
- **Should fix**: brittle locators, duplicated logic that should use a shared Component Object,
  missing tags.
- **Nice-to-have**: unclear naming, could be simplified.

If running inside a flow that has the `ReportFindings` tool available, use it for structured output.
For a quick inline review, present a concise list with file:line references.
