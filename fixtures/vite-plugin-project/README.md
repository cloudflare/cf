# Vite plugin project fixture

This is a manual smoke fixture for Cloudflare Vite development. The `dev` package script runs `vp dev` through the workspace's Vite+ CLI.

No automated test currently starts this fixture.

## Layout

- `package.json` declares the Vite plugin, Vite, Wrangler, and Workers types, and provides the `vp dev` script.
- `vite.config.ts` registers `cloudflare()` and disables inspector-port and persisted-state behavior for the smoke session.
- `cloudflare.config.ts`'s default export contains the Worker entrypoint, compatibility date, name, and `MY_VAR` text binding. Mode `test` produces `Test var`; other modes produce `Default var`.
- `src/worker.ts` returns `MY_VAR` from `/var` and a JSON fixture description from Worker-handled paths.
- `public/` contains `index.html` and `message.txt` static assets.
- `worker-configuration.d.ts` and `tsconfig.json` provide fixture types.

cf supplies `CLOUDFLARE_VITE_FORCE_BUILD_OUTPUT=true` to the detected Vite command. The plugin loads the default export from `cloudflare.config.ts`.

## Workspace and versions

The fixture is included by the root `fixtures/*` workspace glob. Its committed dependencies are registry semver ranges, not environment-specific `link:` targets. A root `pnpm install` resolves them and creates the fixture-local package links expected by the tools.

The workspace aliases `vite` to Vite+ core, which provides no `vite` CLI. The root `vite-plus` dependency supplies the `vp` CLI used by the fixture script.

The current lockfile resolves:

- `@cloudflare/vite-plugin` 2.0.0-beta.sha-ad79608dd;
- Wrangler 4.145.0;
- Vite 8.3.0.

These versions emit the configuration and Build Output Specification artifacts consumed by cf.

## Running the dev script

Build the repository CLI for the fixture's `cf/config` import, then run the dev script from the fixture:

```sh
pnpm install
pnpm build
cd fixtures/vite-plugin-project
pnpm dev
```

Pass custom Vite arguments to the script, for example `pnpm dev --mode test`. The current autoconfig route used by `cf dev` delegates to `npx vite`; it does not yet use this fixture's `vp dev` script.

The server prints its URL. Representative checks are:

```sh
curl http://localhost:5173/var
curl http://localhost:5173/message.txt
curl http://localhost:5173/a-worker-route
```

With the default mode, `/var` returns `Default var`, `message.txt` returns the committed asset text, and a Worker-handled path returns JSON containing `fixture: "vite-plugin-project"`, the request URL, the binding value, and the asset path. The exact port can differ if Vite selects another available port.

`Ctrl+C` is relayed to the framework process and should close the dev server cleanly. The fixture disables Vite-plugin persistence, and repository ignores cover `node_modules/` and local Wrangler state.
