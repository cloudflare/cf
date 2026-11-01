# Workload identity runtime receiver

## Receive a caller through the runtime

For a direct call through a static Worker's own configured service binding,
`caller()` returns a frozen `{ kind: "service-binding", accountId, workerId }`.
It also works inside a top-level `WorkerEntrypoint` RPC method through
`this.ctx.identity.caller()`. You add no identity binding or verifier. Production
facts use the public account tag and immutable Worker product ID (`scriptTag`),
never the pipeline stable ID `main`. Each hop identifies its immediate caller.
Native facts take precedence over every HTTP credential, even malformed fields;
you can read the body first. Cross-account, Durable Object, Preview, dynamic,
loopback, transferred/restored binding, callback, returned-target and persistent
stub paths fail with `WorkloadIdentityUnavailableError` when you ask for identity.
They do not fall back to HTTP credentials. Ordinary URL fetches keep the HTTP
credential contract below. Local static bindings use account `local` and
`local:<worker-name>` IDs; those IDs never establish production identity.

The receiving Worker calls `await ctx.identity.caller()` with no arguments or
receiver binding.

Native service-binding facts identify the immediate calling Worker. JWT facts
identify the originating identity binding's authority; signed-request facts expose
the selected capability's exact URL as `signatureAgent`. Forwarding either
capability preserves its authority; it does not attest the current executor.
The sender's `identity.id` remains an opaque ID. Keep human identity separate.

The runtime verifies lazily and returns frozen facts;
the application checks the exact caller, operation, resource, and JWT audience.
On the HTTP credential path, missing credentials return `null`. Invalid credentials reject with
`WorkloadIdentityError`; unavailable discovery or replay storage rejects with
`WorkloadIdentityUnavailableError`. Signature fields take precedence and never
fall back to bearer verification. Call before reading or locking a signed body.

The private `WorkloadVerifier` service holds public verification data and a
Cloudflare-owned SQLite replay namespace, with no signing secrets. Its host
channel supplies receiver scope in protected props. All versions, replicas and
domains of the same receiving Worker share replay scope. Service calls use
fresh native caller facts rather than inheriting a verified HTTP credential. External receivers still implement the wire profile.

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
