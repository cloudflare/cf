# Wrangler project fixture

This historically named directory is a manual smoke fixture for `cf dev`'s Wrangler fallback. There is no `@cloudflare/wrangler-bundler` dependency or `cf-dev` binary in the shipped implementation. The project declares Wrangler, and compatible Wrangler releases provide `bin/cf-wrangler.js`.

No automated test currently starts this fixture.

## Layout

- `package.json` declares `wrangler` and intentionally has no framework `dev` script, allowing cf to reach fallback discovery.
- `cloudflare.config.ts`'s default export contains the Worker entrypoint, compatibility date, name, and `MY_VAR` text binding. Mode `test` produces `Test var`; other modes produce `Default var`.
- `wrangler.config.ts` supplies the tooling-owned assets directory.
- `src/worker.ts` returns `MY_VAR` from `/var` and a JSON fixture description from Worker-handled paths.
- `public/` contains `index.html` and `message.txt` static assets.

The current `cf-wrangler` delegate uses Wrangler's TypeScript configuration loader. `cloudflare.config.ts` is required and owns the Cloudflare configuration; `wrangler.config.ts` is optional and owns tooling settings. The two are loaded and merged by Wrangler itself, not by cf.

## Workspace and compatibility

The fixture is included by the root `fixtures/*` workspace glob. Its committed Wrangler dependency is 4.136.1, which emits the configuration and Build Output Specification artifacts consumed by cf. There are no environment-specific `link:` targets.

cf requires Wrangler 4.136.0 or newer for this delegate and output contract. For an unpublished workers-sdk worktree, a temporary fixture-local link may be used instead, but no such link belongs to the committed fixture. The relevant upstream executable is `packages/wrangler/bin/cf-wrangler.js`.

## Running through cf

After installing a compatible Wrangler and building cf, invoke the built CLI from the fixture directory:

```sh
pnpm build
cd fixtures/wrangler-bundler-project
../../packages/cli/bin/cf dev
```

An installed compatible `cf` can be used in place of the relative binary. cf finds the fixture-local `node_modules/wrangler`, verifies its installed version, and spawns:

```text
node_modules/wrangler/bin/cf-wrangler.js dev
```

The child inherits stdio and the project working directory. cf also supplies its auth marker and shared registry path, and relays SIGINT/SIGTERM.

The server prints its selected URL. Representative checks are:

```sh
curl http://localhost:8787/var
curl http://localhost:8787/message.txt
curl http://localhost:8787/a-worker-route
```

With the default mode, `/var` returns `Default var`, `message.txt` returns the committed asset text, and a Worker-handled path returns JSON containing `fixture: "wrangler-bundler-project"`, the request URL, the binding value, and the asset path. Use the actual printed port if Wrangler does not select 8787.

`Ctrl+C` should close Wrangler and Miniflare cleanly. Repository ignores cover `node_modules/` and local Wrangler state.
