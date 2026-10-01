# Test import boundaries

Run tests from this package and pass file paths directly, without `--`:

```sh
pnpm test src/__tests__/lib/raw-fetch.test.ts
pnpm test:imports src/__tests__/lib/raw-fetch.test.ts
```

`test:imports` runs isolated forks serially and reports tracked collection
imports, SDK imports, collection time, test time, and the five largest inclusive
import durations. Import counts exclude imports inside external packages and
dynamic imports performed during tests. Those dynamic imports contribute to
test or hook time instead. Inclusive durations overlap and must not be summed.
Later files can reuse Vite's transformed modules, so compare the same file in
fresh runs when timing matters. Isolation remains enabled because tests mutate
the working directory, environment, and module state.

The October 2026 refactor measured the following on the same checkout and
dependencies. These are tracked collection imports per file:

| Test              | Before | After |
| ----------------- | -----: | ----: |
| Raw fetch         | 17,780 |    43 |
| Error rendering   | 17,765 |    27 |
| Auth device login | 17,786 |    48 |

The combined serial profile took 22.07s before and 0.64s after. File order and
transform-cache reuse differed; these are illustrative local timings, not a
controlled whole-suite benchmark. All three files loaded only four SDK error
modules after the change.

Prefer the smallest existing import boundary that owns the behavior:

- Use `#sdk/errors` for SDK error classes, and type-only imports for SDK types.
- Use `lib/auth-token.ts` for token resolution and `lib/oauth/index.ts` for OAuth
  operations. `lib/auth.ts` owns SDK client construction and keeps compatibility
  re-exports for existing callers.
- Use `lib/context.ts` for account and compliance resolution.
- Use package subpaths such as `@cloudflare/workers-utils/compliance` when
  available.
- Keep pure argument-sanitization tests separate from error integration tests.

Partial mocks that call `importOriginal()` still load the original import graph.
Keep integration tests for real client and error-class behavior. Existing raw
fetch and device-login tests also fail if their paths load the SDK client entry.

Further opportunities include narrowing generated SDK clients' runtime error
imports, deferring client imports until API work is needed, and lazy-loading
nested command groups. Those changes need separate measurements and behavioral
coverage. A narrow workers-utils APIError export would also reduce the external
package work that this reporter cannot count individually.
