# HTTP request regression suite

From the repository root:

```sh
pnpm --filter cf test:regression
pnpm --filter cf test:regression -t 'cf zones list$'
pnpm --filter cf test:regression -t 'cf zones list$' -u
pnpm --filter cf test:regression --shard=1/12
```

Install against the frozen lockfile and run `pnpm generate` first when preparing
a fresh checkout. The suite has twelve command files balanced by case count.
Locally, Vitest runs them in parallel worker forks. CI runs the separate
`.github/workflows/regression.yml` workflow as twelve GitHub Actions shards,
each running one file. Each fork owns its temporary working directory, MSW
interceptor, credentials and state, and each command owns its snapshot.
Arguments after `test:regression` go directly to Vitest. The harness checks in
`harness.test.ts` run with the normal CLI test suite.

`cases.ts` covers generated API commands from the tracked command catalogue,
plus every command group that contains one. It omits every command listed in
`hand-written-commands.json`, because those commands orchestrate local
projects, external tools and multi-request workflows. Every remaining leaf and
group runs without arguments. Leaves also run
with required arguments, individual optional flags, all enum choices, both
boolean values, pairwise flag presence/absence, alternate positional values,
aliases, global flags, local mode, raw/file/array bodies and derived body fields.
Equivalent argument vectors are deduplicated. Pairwise coverage is deliberately
bounded rather than an exponential Cartesian product; it covers flag presence,
not every combination of values. Invalid combinations remain in the baseline
with their exit code and error, alongside successful requests.

The real CLI parser, command modules, SDK and HTTP clients run against MSW.
Invocations use deterministic dummy API-token credentials in the environment.
Mock responses are empty success envelopes, apart from the zone-name lookup
used by `--zone <domain>`. Every command must reach its declared method and
endpoint. Local mode keeps request rewriting real and routes Miniflare's
requests through MSW.

Snapshots under `snapshots/<command/path>.snap` contain named cases, complete
arguments, exit outcomes and ordered requests. Requests preserve method, full
URL/query encoding, headers, JSON structure, binary bytes and ordered multipart
parts (including repeated names, file names and MIME types). Only CLI/Node
versions, temporary/fixture paths, random multipart boundaries and multipart
content lengths (which depend on those paths/boundaries) are normalized. Part
contents remain recorded. Fixtures use LF on every OS. No live account is needed.

On failure, Vitest names the command and snapshot file and shows the changed
request beside its case and arguments. Inspect the diff before using `-u`;
review method, URL, authentication/other headers and serialized body. If a new
command cannot reach HTTP, fix its fixture arguments or workflow responses
before accepting a baseline. Commit the reviewed snapshots with the change.
