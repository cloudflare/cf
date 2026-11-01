---
"cf": minor
---

Support experimental Worker identity bindings

Consume SDK support for fixed token audiences, independent grant/signing limits, and direct JSRPC `getIdentity(label?)` handles with asynchronous metadata and normal forwarding/disposal. Select a handle before fetching; normalize URL, FormData, and URLSearchParams inputs with `new Request(...)`. Local issuance remains unsupported, so use mocks or deployed Previews. AbortSignal transport and cross-RPC cancellation are outside the contract.

Validate identity configuration before upload without provisioning identity resources. Caller APIs in local service bindings and generated runtime types require a matching unpublished runtime bundle; they are prototype-only and are not part of this release.
