# Vite Container fixture

This fixture exercises a Durable Object-managed Container built from a
Dockerfile through the local Workers SDK Vite plugin. The config defines
`ContainerDO` as a Durable Object and binds the Container to it. The build
emits the Cloudflare Build Output consumed by `cf deploy --prebuilt`.

A running Docker daemon is required. Build the repository CLI and fixture from
the repository root:

```sh
pnpm install --frozen-lockfile
pnpm --filter cf build
pnpm --filter vite-container-project-fixture build:fixture
```

The explicit `build:fixture` script keeps this Docker-dependent fixture out of
the repository's default `pnpm build` graph.

Then deploy with this checkout's cf binary rather than an unrelated global
installation:

```sh
cd fixtures/vite-container-project
../../packages/cli/bin/cf deploy --prebuilt
```

Deployment requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, or a cf
OAuth profile created with `../../packages/cli/bin/cf auth login --no-device`.
cf does not read Wrangler's stored credentials.

Requests to the deployed Worker are routed through `ContainerDO` to the HTTP
server in the built image. A successful response includes
`"source":"vite-container-fixture"`.
