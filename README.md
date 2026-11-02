# `cf`: the agentic CLI for the entire Cloudflare API

cf is a CLI that is built for the next generation of software development:

- Agents can find the command they need to do anything they want to do with bespoke search and steering.
- JSON is the default interface, pretty printed for humans and condensed for agents for maximum context savings.
- cloudflare.config.ts is the new configuration format for the whole of Cloudflare, starting with Workers, and bringing the safety and accuracy of TypeScript to you and your agent’s language server protocol (LSP)
- Vite becomes default, bringing with it the best local development server, and a plugin suite for developers and framework authors.

Install the open beta today globally and run it from anywhere:

```
npm i -g cf
```

cf supports the latest minor release of each supported Node.js major version.
See [package.json](package.json) for the supported versions.

## Identity prototype

The identity binding upload path supports signing-only bindings without an audience. Local native callers require the companion workerd build. The installed runtime-types package bundles an older type worker and pins its own runtime: `cf workers types` does not yet include `ctx.identity.caller()`. Release this API only after pinning and testing a published runtime-types bundle with the matching workerd build.

The pinned SDK supports fully local identity issuance, discovery, signature verification, replay protection, and configured OAuth. `cf dev` delegates to the project's installed development server; that Wrangler or Vite installation must also use the matching SDK prototype. The local authority generates separate keys and a `.test` issuer without a Cloudflare login or network issuance. Run cooperating Workers in one local graph. Use the companion runtime and `enable_workload_identity_context` for native `ctx.identity.caller()` verification. Persisted project state keeps keys and replay together; independent processes need separate persistence roots.
