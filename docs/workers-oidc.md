# Workload identity runtime receiver

## Receive a caller through the runtime

The receiving Worker calls `await ctx.identity.caller()` with no arguments or
receiver binding. The caller is the authenticated software making the request:
an agent, Worker, service, or another supported workload. Keep any human identity
it acts for separate. The runtime verifies lazily and returns frozen facts;
the application checks the exact caller, operation, resource, and JWT audience.
Missing credentials return `null`. Invalid credentials reject with
`WorkloadIdentityError`; unavailable discovery or replay storage rejects with
`WorkloadIdentityUnavailableError`. Signature fields take precedence and never
fall back to bearer verification. Call before reading or locking a signed body.

The private `WorkloadVerifier` service holds public verification data and a
Cloudflare-owned SQLite replay namespace, with no signing secrets. Its host
channel supplies receiver scope in protected props. All versions, replicas and
domains of the same receiving Worker share replay scope. Service/RPC calls do not
inherit a verified caller. External receivers still implement the wire profile.

Ship the receiver only after the native runtime, host channel, protected compiler
metadata, verifier, replay migration, compatibility review and service access
checks pass together. Local anonymous requests return `null`; credential
verification without the private channel fails unavailable. Explicit test mocks
are not cryptographic proof. Keep sender issuance independently deployable.

`cf workers types` must obtain `CloudflareIdentityContext.caller()` and the
`CloudflareWorkloadIdentity` union from the runtime types provider. It must expose
them for a receiver with no `env.IDENTITY` binding. Do not add a receiver entry to
`cloudflare.config.ts`. Pin the SDK/runtime release containing workerd PR #8121
before advertising this API; a source-only declaration does not supply runtime
support. Existing sender configuration and local issuance errors stay separate.
