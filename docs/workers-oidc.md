# Workers identity draft tooling

The shared workers-sdk configuration and Miniflare service bundles own identity behavior. cf coordinates `workers types`, build, deployment and local development; it contains no second verifier or token-exchange implementation.

## Stored client secrets

1. Register a client-credentials OAuth app at the provider and assign its permissions.
2. Store its secret in same-account Secrets Store with workers scope. Use protected input, for example a user-only temporary JSON file with `cf secrets-store secrets create <store-id> --body @<file>`. Use `--local --persist-to .cloudflare/state` and a test value to match the Vite development server’s default local state; no real credential belongs in source, argv or logs.
3. Configure the existing binding's `oauth.authentication: { method: "client_secret_basic" | "client_secret_post", secret_reference: { store_id, secret_name } }`. Keep `exchange: "client_credentials"`, exact client ID, trusted issuer, optional token endpoint, and required destination/method `resources`.
4. Run `cf dev`; call `const identity = await env.SERVICE.getIdentity(); return identity.fetch(url);`.

Scope and OAuth resource are optional only in this flow. Omission sends no corresponding parameter; empty scope arrays reject. Provider defaults are not zero permissions, and HTTP delivery rules do not narrow a token's provider authority. Stored-secret flows default to Bearer without DPoP; optional `token_protection: "dpop"` requires binding without fallback. Managed-key/WAG and saved-account profiles retain their existing behavior. Top-level `client_authentication` remains the separate fixed key-assertion export capability.

Deployment validates the exact same-account reference/use permission. The managed service resolves it privately on acquisition. Local Miniflare supplies a private per-binding capability; application env contains no readable secret binding. Missing local secrets fail startup. Rotation affects future acquisitions; warm tokens expire or invalidate normally. Missing provider expiry has a maximum 60-second reuse budget from acquisition start, reduced by safety margin. API denials return without replay.

## Matching draft dependencies

Use the same source cohort for service schema-9 reader, EWC compiler, SDK config/build-output/local service bundles, and cf's dependency graph. Readers precede producers. The existing public runtime entry points and workerd/host pin remain unchanged by this extension. Package publication and hosted preview updates are separate from local source verification. Retain the existing published pins until the source cohort is published; a local test overlay must be reported explicitly and must not pretend to be a released artifact.

The CLI regression cases cover both secret methods through type generation and prebuilt upload, without reading secrets, creating connectors or contacting token endpoints. Shared tests exercise actual token and API requests. Use independent local fixtures before claiming provider compatibility. Remote development and arbitrary live-provider access are not deterministic local support.

## Caller and agent identities

`ctx.identity.caller()` remains the receiver API with flat `callerIdentity` configuration. It requires the matching draft runtime, and no outbound identity binding. A positional `getIdentity(agentId)` selects an immutable application actor; `{ agentId }` is equivalent. WAG exchange supports selected agents; managed client credentials uses the default actor. Inbound delegated verification, application session handling, and the separate zone reverse-proxy proposal are unaffected.
