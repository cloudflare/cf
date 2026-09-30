# Vite plugin project fixture

This is a manual smoke fixture for `cf dev` with a Cloudflare Vite project. In the current command flow it exercises autoconfig's detected framework-command route, not fallback implementation discovery: the `dev` package script is `vite dev`, so cf runs that command directly with inherited stdio.

No automated test currently starts this fixture.

## Layout

- `package.json` declares the Vite plugin, Vite, Wrangler, and Workers types, and provides the `vite dev` script.
- `vite.config.ts` registers `cloudflare()` and disables inspector-port and persisted-state behavior for the smoke session.
- `cloudflare.config.ts`'s default export contains the Worker entrypoint, compatibility date, name, and `MY_VAR` text binding. Mode `test` produces `Test var`; other modes produce `Default var`.
- `src/worker.ts` returns `MY_VAR` from `/var` and a JSON fixture description from Worker-handled paths.
- `public/` contains `index.html` and `message.txt` static assets.
- `worker-configuration.d.ts` and `tsconfig.json` provide fixture types.

cf supplies `CLOUDFLARE_VITE_FORCE_BUILD_OUTPUT=true` to the detected Vite command. The plugin loads the default export from `cloudflare.config.ts`.

## Workspace and versions

The fixture is included by the root `fixtures/*` workspace glob. Its committed dependencies are registry semver ranges, not environment-specific `link:` targets. A root `pnpm install` resolves them and creates the fixture-local package links expected by the tools.

The current lockfile resolves:

- `@cloudflare/vite-plugin` 2.0.0-beta.sha-ad79608dd;
- Wrangler 4.145.0;
- Vite 8.3.0.

These versions emit the configuration and Build Output Specification artifacts consumed by cf. The fixture's normal framework-command route does not exercise fallback `bin/cf-vite` discovery.

## Running through cf

Build the repository CLI, then invoke the built binary from the fixture so the project remains cf's working directory:

```sh
pnpm install
pnpm build
cd fixtures/vite-plugin-project
../../packages/cli/bin/cf dev
```

An installed compatible `cf` can be used in place of the relative binary. Autoconfig detects Vite and delegates to the package script. Extra arguments are not currently forwarded on this route; run the Vite command directly when custom Vite arguments are needed.

The server prints its URL. Representative checks are:

```sh
curl http://localhost:5173/var
curl http://localhost:5173/message.txt
curl http://localhost:5173/a-worker-route
```

With the default mode, `/var` returns `Default var`, `message.txt` returns the committed asset text, and a Worker-handled path returns JSON containing `fixture: "vite-plugin-project"`, the request URL, the binding value, and the asset path. The exact port can differ if Vite selects another available port.

`Ctrl+C` is relayed to the framework process and should close the dev server cleanly. The fixture disables Vite-plugin persistence, and repository ignores cover `node_modules/` and local Wrangler state.
