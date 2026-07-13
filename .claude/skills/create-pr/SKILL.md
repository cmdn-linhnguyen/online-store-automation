---
name: create-pr
description: Run the quality gate (typecheck, lint, test:smoke) then open a Pull Request for online-store-automation using a standard template (summary, scenario coverage, how to verify). Use when the user wants to package tests just written into a PR, or open a PR after /review-test has passed. Never push or open a PR if the gate fails or without user confirmation.
---

# Create PR — package test automation into a PR

## 1. Check state first

- `git status` / `git diff` to know exactly what changes will go into the PR.
- If `/review-test` hasn't run on this diff yet, recommend running it first (not mandatory if the
  user has already reviewed it themselves).

## 2. Run the gate — must pass before creating the PR

```
pnpm typecheck
pnpm lint
pnpm test:smoke
```

- If the change affects a large/important regression area, ask the user whether to also run
  `pnpm test` (full suite, slower) before creating the PR — not required by default since CI runs
  the full suite after the PR is opened.
- If any step fails: stop, fix, rerun the gate — never create a PR while it's failing.

## 3. Confirm with the user before pushing/creating the PR

Pushing a branch and opening a PR are visible to others (shared state) — always confirm with the
user first, even if the gate has passed.

## 4. Create the PR from the template

Use `gh pr create` with this body structure:

```markdown
## Summary
- <short bullet summary of the scenario/feature tested>

## Test scenarios covered
- [x] <scenario 1 — cross-reference docs/test-plan.md if applicable>
- [x] <scenario 2>

## How to verify
- `pnpm test <path to spec>` (or by tag: `pnpm test --grep <tag>`)
- Report: `pnpm report` after running to view the HTML report

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Keep the PR title short (under 70 chars) and scoped (e.g. `test(search): add search bar and sort
coverage`).

## 5. After creating

- Return the PR link to the user.
- If `docs/test-plan.md` isn't fully checked off for the scenarios in this PR, remind the user (or
  check it off yourself if already confirmed during `/write-test`) to keep the doc reflecting real
  coverage.
