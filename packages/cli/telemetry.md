# cf CLI Telemetry

Cloudflare gathers anonymous, non-user-identifying telemetry about usage of the
[`cf` CLI](https://www.npmjs.com/package/cf), the command-line interface for
Cloudflare's APIs and developer workflows. You can
[opt out of sharing telemetry](#how-can-i-configure-cf-telemetry) at any time.

This policy describes telemetry sent by `cf` itself. Tools invoked by `cf dev`
or `cf build` may have their own telemetry settings.

## Why are we collecting telemetry data?

Telemetry helps us identify bugs and understand which commands and features are
used. This lets us prioritize fixes and make informed decisions about the CLI.

## What telemetry data is Cloudflare collecting?

Command telemetry uses command-started and command-finished events containing:

- The canonical command path (for example, `cf zones list`), without positional
  values.
- The search query passed to `cf cli search`, to help us make sure relevant results are being returned.
- The names of flags used and their combinations. Boolean and recognized enum
  values may be included; free-form values are replaced with `<REDACTED>`.
- Command duration and its outcome (`success`, `error`, or `cancelled`).
- Error class, HTTP status, and numeric Cloudflare API error codes when a
  command fails. Error messages and stack traces are not sent.
- The `cf` version and prerelease label, when present.
- OS family and version, architecture, Node.js major version, and package
  manager.
- Whether this is the first recorded use on the machine, and whether the
  command runs in CI, interactively, or through local-install delegation.
- The detected coding-agent harness identifier, if any. When the harness
  provides a session ID, `cf` sends a device-specific hash of that ID to
  correlate commands in the same agent session. The raw session ID, model,
  and invocation ID are not included.
- A random device identifier and event/session identifiers used to group
  telemetry from the same machine and run.

When help is shown, `cf` sends one `cf help shown` event with the command path.
Help events do not include arguments or command duration.

Cloudflare receives the IP address associated with the telemetry request. It is
handled according to Cloudflare's
[Privacy Policy](https://www.cloudflare.com/privacypolicy/).

Separately from command telemetry, Cloudflare API requests made by `cf` include
the CLI version and execution mode in headers, and the detected agent harness
identifier when applicable. Disabling command telemetry does not disable API
requests needed to carry out commands.

## What is never collected?

Apart from the `cf cli search` query described above, `cf` does not include account or zone identifiers, domain names, positional
values, request or file contents, file paths, credentials, raw error messages,
stack traces, or API response data in its command telemetry. Free-form flag
values are redacted, and error reporting uses only the error class, status, and
numeric codes described above.

## How can I inspect what is sent?

Run a command with `DEBUG=1` while telemetry is enabled. `cf` prints the
telemetry payload to stderr before sending it:

```sh
DEBUG=1 cf zones list
```

Telemetry is sent in the background and has a short request timeout. A failure
to send telemetry does not fail the command.

## How can I configure cf telemetry?

Telemetry is enabled by default. To change the machine-wide preference or
check its current status, run:

```sh
cf cli telemetry disable
cf cli telemetry enable
cf cli telemetry status
```

For an individual invocation, set `CF_SEND_TELEMETRY=false` to disable
telemetry or `CF_SEND_TELEMETRY=true` to enable it:

```sh
CF_SEND_TELEMETRY=false cf zones list
```

`DO_NOT_TRACK=1` (or `true`) always disables `cf` telemetry, even when another
setting enables it. `cf cli telemetry status` shows the effective setting and
its source. `cf` does not read Wrangler's saved telemetry preference or project
configuration.

There is no per-project telemetry setting in `cloudflare.config.ts`.
