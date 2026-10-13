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

## Sharing a development registry

cf keeps its development registry in its own config directory by default, even
when a legacy `~/.wrangler` directory exists. To connect service or Durable
Object bindings between separate `cf dev` and `wrangler dev` processes, set
`WRANGLER_REGISTRY_PATH` to the same absolute directory in both terminals.

Run the appropriate command below from a common parent directory in each
terminal, before changing into either Worker project. Then start the development
servers.

On macOS or Linux:

```sh
export WRANGLER_REGISTRY_PATH="$PWD/.cloudflare/dev-registry"
```

On Windows with PowerShell:

```powershell
$env:WRANGLER_REGISTRY_PATH = Join-Path (Get-Location).Path ".cloudflare/dev-registry"
```

cf also accepts `MINIFLARE_REGISTRY_PATH` for sharing with standalone Vite or
Miniflare processes. If multiple variables are set, cf uses the first nonempty
value in this order: `CLOUDFLARE_REGISTRY_PATH`, `WRANGLER_REGISTRY_PATH`,
`MINIFLARE_REGISTRY_PATH`. The selected path also applies to `cf --local`
commands. Without an explicit path, cf and standalone Wrangler retain their own
defaults and do not automatically discover each other's Workers.
