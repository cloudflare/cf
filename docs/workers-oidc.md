# Workload identity runtime types

The working signer implementation is [`birvine-broque/workers-oidc` on `main`](https://gitlab.cfdata.org/birvine-broque/workers-oidc/-/tree/main).

Use the [receiver contract](https://gitlab.cfdata.org/birvine-broque/workers-oidc/-/blob/main/docs/spec.md#receive-a-caller-through-the-runtime) for caller kinds, credential handling and authorization requirements.

`cf workers types` will obtain `CloudflareIdentityContext.caller()` and the
`CloudflareWorkloadIdentity` union from the runtime types provider once cf pins
a matching published runtime-types bundle, including for receivers with no
outbound identity binding. Until then, add no receiver configuration to
`cloudflare.config.ts`.

Publish a matching workerd and SDK/runtime-types release containing workerd
PR #8121 before advertising local receiver support. Source declarations alone
do not supply runtime behavior. Local sender issuance remains unsupported.

Managed OAuth uses automatic DPoP with no public policy setting. Every token
request carries a proof and accepts DPoP or Bearer; API authentication follows
the returned type. Reject the former `dpop` and `require_sender_constraint` fields.
Shared SDK validation owns this contract; cf preserves policy-free configuration
through types, Build Output, upload and the unsupported local stub without
acquiring credentials. Match SDK/compiler/service revisions: new OAuth capabilities
use protected schema version 4 while earlier compiled capabilities keep their
original behavior internally.

## Selected agents and local qualification

A positional `getIdentity(agentId)` always selects an application-supplied
immutable agent ID; `getIdentity({ agentId })` is equivalent. The selected handle
supports its configured `getToken()`, `getAuthorizationGrant()` and `fetch()`
operations, including after forwarding. Root issuance keeps the default workload
actor. Customer and connection selectors belong to the proposed connector API,
not this workload implementation.

The companion workers-oidc repository's `examples/agent-identity` runs the actual
signer and an independent receiver through ordinary `cf dev` service bindings.
Run `bun run --cwd examples/agent-identity check` there for verified two-agent
OIDC/WAG/WBA correlation, managed cache separation and forwarding. This is an
explicit test authority with disposable local keys. The shared Miniflare
identity stub remains unsupported; cf does not contain a bundled signer copy.

Publish the matching workerd type-generation worker and SDK packages, then
update cf's pinned SDK cohort together. A local source or inference-type update
does not update the released `cf workers types` provider. Keep that release
dependency explicit; do not substitute a fake published revision or synthesize
receiver verification from decoded claims.
