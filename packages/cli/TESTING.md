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

Command integration files that need the real SDK should import their client
boundary during collection. Loading a large cold graph inside the first command
counts against that test's timeout, and a timed-out async command can continue
into the following test. Keep this explicit import local to those integration
files.

The follow-up SDK refactor normalizes generated clients with
`generator/sdk-error-imports.ts` on every `pnpm generate`. It separates the
type-only API namespace from runtime error constructors and keeps the public
SDK barrel unchanged. The CLI uses `#sdk/client` and `#sdk/environments` to avoid
that public barrel. Unknown runtime namespace uses are preserved conservatively.

On the same dependencies, `pnpm test:imports src/__tests__/lib/auth.test.ts`
collected 17,779 modules (17,742 SDK) before and 1,444 (1,407 SDK) after.
Collection time fell from 14.97s to 3.44s in separate fresh runs, about 77%.
Client modules still load statically; this change removes the type and resource
barrels reached through error constructors. The generated diff is mechanical
and reproducible, with coverage for constructor identity and response details.
