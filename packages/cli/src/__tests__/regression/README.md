# HTTP request regression suite

From the repository root:

```sh
pnpm --filter cf test:regression
pnpm --filter cf test:regression -t 'cf zones list$'
pnpm --filter cf test:regression -t 'cf zones list$' -u
pnpm --filter cf test:regression --shard=1/2
pnpm --filter cf test:regression --shard=2/2
```

Install against the frozen lockfile and run `pnpm generate` first when preparing
a fresh checkout. The dedicated runner includes Vitest startup in a hard
180-second wall-time deadline and terminates the process tree when it expires.
The suite uses six worker forks across twelve balanced command files. Each fork
owns its temporary working directory, MSW interceptor, credentials and state;
each command owns its snapshot, so files can run in parallel or on separate CI
shards. Arguments after `test:regression` go directly to Vitest.

`cases.ts` discovers executable commands from the tracked command catalogue,
adds the hidden login alias, and discovers intermediate command groups from the
generated source. Every leaf and group runs without arguments. Leaves also run
with required arguments, individual optional flags, all enum choices, both
boolean values, pairwise flag presence/absence, alternate positional values,
aliases, global flags, local mode, raw/file/array bodies and derived body fields.
Equivalent argument vectors are deduplicated. Pairwise coverage is deliberately
bounded rather than an exponential Cartesian product; it covers flag presence,
not every combination of values. Invalid combinations remain in the baseline
with their exit code and error, alongside successful requests.

The real CLI parser, command modules, SDK and HTTP clients run against MSW.
Invocations use deterministic dummy API-token credentials in the environment.
`workflows.ts` supplies original local project fixtures and response shapes for
multi-request workflows. Generated commands must reach their declared method
and endpoint, and API-backed
hand-written workflows must reach their main endpoint. Docker, SSH, cloudflared,
project subprocesses, installs, native profiling and the Miniflare process are
replaced at their OS boundary. Local request rewriting remains real. These
snapshots cover the CLI's HTTP behavior, not those external programs.

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
