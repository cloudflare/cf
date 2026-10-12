# Test import boundaries

Run tests from this package and pass file paths directly, without `--`:

```sh
pnpm test src/__tests__/lib/raw-fetch.test.ts
pnpm test:imports src/__tests__/lib/raw-fetch.test.ts
```

`test:imports` runs isolated forks serially and reports tracked collection
imports, collection time, test time, and the five largest inclusive
import durations. Import counts exclude imports inside external packages and
dynamic imports performed during tests. Those dynamic imports contribute to
test or hook time instead. Inclusive durations overlap and must not be summed.
Later files can reuse Vite's transformed modules, so compare the same file in
fresh runs when timing matters. Isolation remains enabled because tests mutate
the working directory, environment, and module state.

Prefer the smallest existing import boundary that owns the behavior:

- Use `#api` for the request runtime (`Client`, `ApiError`) in `src/api/`.
- Use `lib/auth-token.ts` for token resolution and `lib/oauth/index.ts` for OAuth
  operations. `lib/auth.ts` owns client construction and keeps compatibility
  re-exports for existing callers.
- Use `lib/context.ts` for account and compliance resolution.
- Use package subpaths such as `@cloudflare/workers-utils/compliance` when
  available.
- Keep pure argument-sanitization tests separate from error integration tests.

Partial mocks that call `importOriginal()` still load the original import graph.
Keep integration tests for real client and error-class behavior.

Further opportunities include deferring client imports until API work is
needed and lazy-loading nested command groups. Those changes need separate measurements and behavioral
coverage. A narrow workers-utils APIError export would also reduce the external
package work that this reporter cannot count individually.

The commands do not depend on a generated SDK: each one imports its operation
from `#operations/<resource>/…/<op>.js` and sends it through the small runtime
in `#api`, so a command test loads its product's command modules, their
operations and that runtime.
