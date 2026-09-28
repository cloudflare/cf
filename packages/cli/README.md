# cf

A unified command-line interface for Cloudflare, generated from Cloudflare's public OpenAPI surface and published as the unscoped `cf` npm package.

This is a beta preview. To learn more, see the [announcement blog post](https://blog.cloudflare.com/cf-cli-local-explorer/).

## Install

```sh
npm install -g cf
```

Requires Node.js 22 or newer.

## Quick start

```sh
cf auth login        # Authenticate with Cloudflare
cf --help            # Browse all commands
cf <command> --help  # Per-command help
cf complete bash >> ~/.bashrc   # Install shell completions
```

## License

Licensed under either the Apache License 2.0 or the MIT License, at your
option.

Generated API commands follow the shape `cf <product> [group…] <operation>`. Use help or shell completion to discover the current surface; it changes with the pinned public OpenAPI release.

## Authentication

cf resolves credentials in this order:

1. `CLOUDFLARE_API_TOKEN` environment variable
2. The OAuth profile selected by `--profile`, the nearest directory binding,
   or the default profile (refreshed automatically)

Use `cf auth create`, `delete`, `activate`, `deactivate`, and `list` to manage
named profiles. `cf auth login` and `cf auth logout` manage the default profile.

## Projects

`cf init [directory]` starts a project. If you leave out the directory, cf asks for one (use `cf init .` for the current directory in scripts). In a new or empty directory (only `.git` is allowed), it creates a hello-world Worker with `cloudflare.config.ts`, `vite.config.ts`, `src/index.ts`, `tsconfig.json`, `package.json`, and `.gitignore`, then installs dependencies with the package manager you choose (`--package-manager`, or `--no-install` to skip) and, once they are installed, generates Worker types in `.cloudflare/types/index.d.ts`. With `--no-install`, the types are generated later by `cf dev` or the project's `typecheck` script, which runs `cf workers types` and then `tsc`. In a directory that already contains files, it configures the existing project with autoconfig instead. Either way, it finishes with the next steps to run. `cf init workers [directory]` is the default initializer and currently does the same thing.

```sh
cf init my-worker
cd my-worker
cf dev
```

`cf dev` and `cf build` detect supported projects, run autoconfiguration when needed, and invoke the canonical framework command or an installed Cloudflare implementation. Successful builds produce standardized Build Output.

`cf deploy` builds by default and then uploads that output. `cf workers versions create` uploads a version without deploying it, and `cf workers triggers deploy` applies the configured routes and cron schedules. Pass `--prebuilt` to any of these commands to reuse existing Build Output.

## Local resources

Add `--local` to a supported command to run it against a short-lived Miniflare instance backed by cf's persisted local state. Cold-state support includes KV key get/list/update/delete and bulk get, D1 raw plus D1 migration list/apply, and R2 object get/upload/list and array-body bulk delete. Some Durable Object and Workflow operations additionally require a compatible live registry peer that advertises their bindings. Use `--persist-to <directory>` to select a different state directory; it is valid only with `--local`. Commands with no local explorer equivalent return an error instead of falling through to production.

## Output

Structured API results are pretty-printed JSON on stdout. Generated `binary` and `text` response kinds instead write their payload directly to stdout, preserving binary output for redirection; some binary commands provide `--text` for UTF-8 decoding. Null-result success markers go to stderr. On an interactive, color-capable TTY, clack progress animation uses stdout before the final payload; it is disabled for pipes, color-disabled terminals, or `CF_QUIET=1`. Pipe JSON results through `jq` for newline-delimited or filtered output.

cf uses a semantic colour palette designed to remain legible on both light and
dark terminal backgrounds. Set `NO_COLOR=1` to disable styling entirely.

Supported terminals also show progress outside the terminal buffer, such as in
the tab title or OS taskbar. Set `CF_NO_OSC_PROGRESS=1` to disable this globally.
Set `CF_FORCE_OSC_PROGRESS=1` to enable it for an unrecognized compatible
terminal.

## Documentation

- [Cloudflare developer docs](https://developers.cloudflare.com/)
- [cf CLI telemetry](https://github.com/cloudflare/cf/blob/main/packages/cli/telemetry.md)
