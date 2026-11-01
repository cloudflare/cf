# Workload identity runtime types

Use the [receiver contract](https://gitlab.cfdata.org/birvine-broque/workers-oidc/-/blob/codex/workers-oidc-spec/docs/spec.md#receive-a-caller-through-the-runtime) for caller kinds, credential handling and authorization requirements.

`cf workers types` will obtain `CloudflareIdentityContext.caller()` and the
`CloudflareWorkloadIdentity` union from the runtime types provider once cf pins
a matching published runtime-types bundle, including for receivers with no
outbound identity binding. Until then, add no receiver configuration to
`cloudflare.config.ts`.

Publish a matching workerd and SDK/runtime-types release containing workerd
PR #8121 before advertising local receiver support. Source declarations alone
do not supply runtime behavior. Local sender issuance remains unsupported.
