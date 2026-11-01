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

Managed OAuth configuration supports `oauth.dpop: "preferred"` (default),
`"required"`, or `"disabled"` for either grant. Legacy
`require_sender_constraint: true` still means required and cannot accompany
`dpop`. Shared SDK validation owns this contract; cf preserves it through types,
Build Output, upload, and the unsupported local stub without acquiring credentials.
Use matching SDK/compiler/service revisions: new OAuth capabilities use protected
schema version 3 while legacy version-1/2 capabilities retain required DPoP.
