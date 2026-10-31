---
"cf": minor
---

Use direct JSRPC identity fetchers in experimental Worker configuration

Update the SDK packages so selected identity handles expose asynchronous metadata and normal RPC forwarding and disposal. Select the default identity with `getIdentity()` before fetching; the parent has no public fetch method. Normalize URL, FormData, or URLSearchParams inputs into a Request before calling a selected handle's fetch method. AbortSignal options and cross-RPC cancellation guarantees are outside this contract. No identity compatibility flag is required.
