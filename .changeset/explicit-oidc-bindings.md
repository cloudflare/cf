---
"cf": minor
---

Support experimental Worker identity bindings and local native callers

Consume SDK support for fixed token audiences, independent grant/signing limits, and direct JSRPC `getIdentity(label?)` handles with asynchronous metadata and normal forwarding/disposal. Select a handle before fetching; normalize URL, FormData, and URLSearchParams inputs with `new Request(...)`. Local issuance remains unsupported, so use mocks or deployed Previews. AbortSignal transport and cross-RPC cancellation are outside the contract.

Validate identity configuration before upload without provisioning identity resources. With a companion runtime, ordinary local service bindings expose immediate caller facts through `ctx.identity.caller()`; local HTTP credential verification remains unavailable by default.
