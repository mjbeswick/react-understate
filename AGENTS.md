# Agent Operating Rules

Treat each item as mandatory.

## Code Style

- Use single quotes in all code.
- Prefer TypeScript `type` aliases over `interface` unless a file already establishes otherwise.
- Preserve indentation and spacing; never convert tabs to spaces or vice versa.
- Keep code readable with explicit variable names and early returns.
- Add comments only to clarify non-obvious intent; avoid narrating actions.

## Logging Conventions

- Prefix console output with the construct type (`state:`, `derived:`, `effect:`, `action:`).
- Ensure Understate actions log when called.
- Do not use the word `executing` in log messages.

## Async & Concurrency

- Name actions when possible; named async actions default to `concurrency: 'queue'`.
- Use `{ concurrency: 'drop' }` when overlapping calls should reject with `ConcurrentActionError`.
- Pass and respect `AbortSignal` for cancellable I/O.

## Testing & Validation

- Prefer running route matchers through the root matcher and `checkCurrentRoute` to simulate real scenarios.
- Run focused tests, lint, and type checks whenever edits might affect behavior or typings.
- If tooling cannot run, state the reason in the final summary and flag unverified areas.
- Run tests with coverage to ensure all code is covered.
- All tests should be in the `src` directory and have the `.test.ts` extension.

## Build & Artifacts

- Build artifacts must not contain the word `tacit` in their names.

## Documentation & Writing

- Keep documentation concise; avoid repetition.
- Use fenced code blocks for examples and inline code for identifiers; avoid bare URLs.
- Reference files or functions with backticked paths (e.g., `src/effects.ts:120`).
- Keep `README.md` and any `pages/` content in sync with behavior and API edits.
- Ensure touched files under `src/` expose JSDoc with at least one usage example per exported entry point.

## Linting & Safety

- Do not introduce lint or type errors; run lint checks after edits.
- Avoid unsafe casts such as `any` unless absolutely necessary and documented.
- Refer to changes as "edits" and only modify what is required; do not reformat unrelated files.
- Never undo or overwrite edits you did not author unless explicitly asked.
- Avoid destructive commands (`rm -rf`, forced resets) unless clearly requested.
- Never expose secrets or sensitive paths in responses.

## API & Mutation Conventions

- Do not use `arrayState`; it has been removed.
- Use `state<T>(initial, { observeMutations: true })` for arrays or plain objects that require mutation observation.
- Assign to `value` for full replacements (e.g., `todos.value = [...]`).
- When mutating via proxies, perform edits inside actions for logging and batching.
- Remember `observeMutations: true` is shallow:
  - Arrays: mutator methods clone, mutate, then set.
  - Objects: property changes clone the object before setting.
  - Nested arrays on observed objects are proxied for array mutators.
- Do not rely on deep observation of nested objects unless explicitly supported.

## Git Workflow

- Inspect `git status` before starting and after finishing edits.
- Use Conventional Commits (`type(scope): description`) with scopes as focused as possible (e.g., `effects`, `docs`).
- Keep commit summaries under 60 characters and describe the edit, not the request.

## Communication

- When requirements are unclear, ask for clarification rather than guessing.
- Summaries should note what changed, why it mattered, and suggest follow-ups when relevant.

Following these rules keeps automated edits predictable and aligned with project conventions.
