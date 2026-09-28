// Generated from cloudflare/workers-sdk@93d72a577. Do not rename cases.
import { describe, it } from "vitest";

const groups = [
	{
		file: "api.test.ts",
		ancestors: ["parseRequestInput for fetch on unstable dev"],
		status: "skip",
		names: [
			"should allow no input to be passed in",
			"should allow string of pathname to be passed in",
			"should allow string of pathname and querystring to be passed in",
			"should allow full url to be passed in as string and stripped",
			"should allow URL object without pathname to be passed in and stripped",
			"should allow URL object with pathname to be passed in and stripped",
			"should allow URL object with pathname and querystring to be passed in and stripped",
			"should allow request object to be passed in",
			"should parse to give https url with localProtocol = https",
			"should parse to give http url with localProtocol = http",
			"should parse to give http url with localProtocol not set",
		],
	},
	{
		file: "auth-credentials.test.ts",
		ancestors: ["writeAuthCredentials"],
		status: "skip",
		names: [
			"round-trips a UserAuthConfig through the TOML file",
			"writes a new auth config file with mode 0o600",
			"tightens permissions on a pre-existing auth config file with looser mode",
		],
	},
	{
		file: "auth-credentials.test.ts",
		ancestors: ["createTomlFileStorage read() contract"],
		status: "skip",
		names: [
			"returns undefined when the file does not exist",
			"returns undefined for an unparseable file rather than throwing",
			"propagates genuine I/O errors (e.g. when the path is a directory)",
		],
	},
	{
		file: "check-fetch.test.ts",
		ancestors: ["shouldCheckFetch()"],
		status: "skip",
		names: [
			"should be true for old compat date",
			"should be false for new compat date",
			"should be true for old compat date + old compat flag",
			"should be false for old compat date + new compat flag",
			"should be true for new compat date + old compat flag",
			"should be false for new compat date + new compat flag",
		],
	},
	{
		file: "cloudchamber/modify.test.ts",
		ancestors: ["cloudchamber modify"],
		status: "todo",
		names: [
			"should help",
			"should modify deployment (detects no interactivity)",
			"should modify deployment with wrangler args (detects no interactivity)",
			"can't modify deployment due to lack of deploymentId (json)",
		],
	},
	{
		file: "core/main-handleerror-fallback.test.ts",
		ancestors: ["main() handleError fallback"],
		status: "todo",
		names: ["writes original error to stderr when handleError throws"],
	},
	{
		file: "d1/list.test.ts",
		ancestors: ["list"],
		status: "todo",
		names: [
			"should print valid json if `--json` flag is specified, without wrangler banner",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: ["config/args merging ('default')", "name resolution", "deploy"],
		status: "skip",
		names: [
			"--name CLI flag overrides config name",
			"uses config name when --name is not provided",
			"errors when no name is provided from either source",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('default')",
			"name resolution",
			"versions upload",
		],
		status: "skip",
		names: [
			"--name CLI flag overrides config name",
			"uses config name when --name is not provided",
			"errors when no name is provided from either source",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('default')",
			"compatibility date and flags",
			"deploy",
		],
		status: "skip",
		names: [
			"--compatibility-date CLI flag overrides config",
			"uses config compatibility_date when CLI flag not provided",
			"--compatibility-flags CLI flag overrides config",
			"uses config compatibility_flags when CLI flag not provided",
			"--latest sets compatibility date to the default",
			"errors when no compatibility_date from either source",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('default')",
			"compatibility date and flags",
			"versions upload",
		],
		status: "skip",
		names: [
			"--compatibility-date CLI flag overrides config",
			"uses config compatibility_date when CLI flag not provided",
			"--compatibility-flags CLI flag overrides config",
			"uses config compatibility_flags when CLI flag not provided",
			"--latest sets compatibility date to the default",
			"errors when no compatibility_date from either source",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: ["config/args merging ('default')", "bundling flags", "deploy"],
		status: "skip",
		names: [
			"--minify overrides config.minify",
			"uses config.minify when CLI flag not provided",
			"--no-bundle skips bundling",
			"config no_bundle skips bundling",
			"warns when --minify and --no-bundle are both set",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('default')",
			"bundling flags",
			"versions upload",
		],
		status: "skip",
		names: [
			"--no-bundle skips bundling",
			"config no_bundle skips bundling",
			"warns when --minify and --no-bundle are both set",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: ["config/args merging ('default')", "build options", "deploy"],
		status: "skip",
		names: [
			"--jsx-factory overrides config.jsx_factory",
			"--jsx-fragment overrides config.jsx_fragment",
			"--tsconfig overrides config.tsconfig",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('default')",
			"build options",
			"versions upload",
		],
		status: "skip",
		names: [
			"--jsx-factory overrides config.jsx_factory",
			"--jsx-fragment overrides config.jsx_fragment",
			"--tsconfig overrides config.tsconfig",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('default')",
			"variables, and aliases",
			"deploy",
		],
		status: "skip",
		names: [
			"--var adds plain_text binding to upload metadata",
			"--var coexists with config vars",
			"--alias resolves module at bundle time",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('default')",
			"variables, and aliases",
			"versions upload",
		],
		status: "skip",
		names: [
			"--var adds plain_text binding to upload metadata",
			"--var coexists with config vars",
			"--define is applied at bundle time",
			"--define merges over config.define (CLI wins)",
			"--alias resolves module at bundle time",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: ["config/args merging ('default')", "deploy-only args"],
		status: "skip",
		names: [
			"--route overrides config.routes",
			"uses config.routes when --route is not provided",
			"uses config.route (singular) when config.routes not provided",
			"--triggers overrides config.triggers.crons",
			"uses config.triggers.crons when --triggers not provided",
			"--logpush overrides config.logpush",
			"uses config.logpush when --logpush not provided",
			"--tag and --message set annotations on deploy",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: ["config/args merging ('default')", "versions upload-only args"],
		status: "skip",
		names: [
			"--tag and --message set annotations",
			"--preview-alias sets annotation",
			"annotations default to undefined when no flags provided",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: ["config/args merging ('default')", "shared args", "deploy"],
		status: "skip",
		names: [
			"--dry-run compiles without uploading",
			"--outdir writes bundled output",
			"positional script arg overrides config.main",
			"--secrets-file adds secret bindings",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('default')",
			"shared args",
			"versions upload",
		],
		status: "skip",
		names: [
			"--dry-run compiles without uploading",
			"--outdir writes bundled output",
			"positional script arg overrides config.main",
			"--secrets-file adds secret bindings",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('default')",
			"upload source maps",
			"deploy",
		],
		status: "skip",
		names: [
			"--upload-source-maps overrides config",
			"uses config.upload_source_maps when CLI flag not provided",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('default')",
			"upload source maps",
			"versions upload",
		],
		status: "skip",
		names: [
			"--upload-source-maps overrides config",
			"uses config.upload_source_maps when CLI flag not provided",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('default')",
			"keep_vars behavior",
			"deploy",
		],
		status: "skip",
		names: [
			"without --keep-vars, keepVars is not set",
			"--keep-vars alone enables keep_bindings",
			"config.keep_vars alone enables keep_bindings",
			"config.keep_vars wins over CLI flag",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('default')",
			"keep_vars behavior",
			"versions upload",
		],
		status: "skip",
		names: [
			"without --keep-vars, keepVars is not set",
			"--keep-vars alone enables keep_bindings",
			"config.keep_vars=true adds plain_text and json to keep_bindings",
			"config.keep_vars=false still includes secret types but not plain_text/json",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('default')",
			"non-versioned settings",
			"versions upload",
		],
		status: "skip",
		names: [
			"logpush and observability are excluded from upload metadata",
			"tail_consumers is included in upload metadata",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('default')",
			"non-versioned settings",
			"deploy",
		],
		status: "skip",
		names: [
			"logpush is patched via non-versioned settings",
			"observability is patched via non-versioned settings",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('deploy helpers')",
			"name resolution",
			"deploy",
		],
		status: "skip",
		names: [
			"--name CLI flag overrides config name",
			"uses config name when --name is not provided",
			"errors when no name is provided from either source",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('deploy helpers')",
			"name resolution",
			"versions upload",
		],
		status: "skip",
		names: [
			"--name CLI flag overrides config name",
			"uses config name when --name is not provided",
			"errors when no name is provided from either source",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('deploy helpers')",
			"compatibility date and flags",
			"deploy",
		],
		status: "skip",
		names: [
			"--compatibility-date CLI flag overrides config",
			"uses config compatibility_date when CLI flag not provided",
			"--compatibility-flags CLI flag overrides config",
			"uses config compatibility_flags when CLI flag not provided",
			"--latest sets compatibility date to the default",
			"errors when no compatibility_date from either source",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('deploy helpers')",
			"compatibility date and flags",
			"versions upload",
		],
		status: "skip",
		names: [
			"--compatibility-date CLI flag overrides config",
			"uses config compatibility_date when CLI flag not provided",
			"--compatibility-flags CLI flag overrides config",
			"uses config compatibility_flags when CLI flag not provided",
			"--latest sets compatibility date to the default",
			"errors when no compatibility_date from either source",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('deploy helpers')",
			"bundling flags",
			"deploy",
		],
		status: "skip",
		names: [
			"--minify overrides config.minify",
			"uses config.minify when CLI flag not provided",
			"--no-bundle skips bundling",
			"config no_bundle skips bundling",
			"warns when --minify and --no-bundle are both set",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('deploy helpers')",
			"bundling flags",
			"versions upload",
		],
		status: "skip",
		names: [
			"--no-bundle skips bundling",
			"config no_bundle skips bundling",
			"warns when --minify and --no-bundle are both set",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('deploy helpers')",
			"build options",
			"deploy",
		],
		status: "skip",
		names: [
			"--jsx-factory overrides config.jsx_factory",
			"--jsx-fragment overrides config.jsx_fragment",
			"--tsconfig overrides config.tsconfig",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('deploy helpers')",
			"build options",
			"versions upload",
		],
		status: "skip",
		names: [
			"--jsx-factory overrides config.jsx_factory",
			"--jsx-fragment overrides config.jsx_fragment",
			"--tsconfig overrides config.tsconfig",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('deploy helpers')",
			"variables, and aliases",
			"deploy",
		],
		status: "skip",
		names: [
			"--var adds plain_text binding to upload metadata",
			"--var coexists with config vars",
			"--alias resolves module at bundle time",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('deploy helpers')",
			"variables, and aliases",
			"versions upload",
		],
		status: "skip",
		names: [
			"--var adds plain_text binding to upload metadata",
			"--var coexists with config vars",
			"--define is applied at bundle time",
			"--define merges over config.define (CLI wins)",
			"--alias resolves module at bundle time",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: ["config/args merging ('deploy helpers')", "deploy-only args"],
		status: "skip",
		names: [
			"--route overrides config.routes",
			"uses config.routes when --route is not provided",
			"uses config.route (singular) when config.routes not provided",
			"--triggers overrides config.triggers.crons",
			"uses config.triggers.crons when --triggers not provided",
			"--logpush overrides config.logpush",
			"uses config.logpush when --logpush not provided",
			"--tag and --message set annotations on deploy",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('deploy helpers')",
			"versions upload-only args",
		],
		status: "skip",
		names: [
			"--tag and --message set annotations",
			"--preview-alias sets annotation",
			"annotations default to undefined when no flags provided",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('deploy helpers')",
			"shared args",
			"deploy",
		],
		status: "skip",
		names: [
			"--dry-run compiles without uploading",
			"--outdir writes bundled output",
			"positional script arg overrides config.main",
			"--secrets-file adds secret bindings",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('deploy helpers')",
			"shared args",
			"versions upload",
		],
		status: "skip",
		names: [
			"--dry-run compiles without uploading",
			"--outdir writes bundled output",
			"positional script arg overrides config.main",
			"--secrets-file adds secret bindings",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('deploy helpers')",
			"upload source maps",
			"deploy",
		],
		status: "skip",
		names: [
			"--upload-source-maps overrides config",
			"uses config.upload_source_maps when CLI flag not provided",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('deploy helpers')",
			"upload source maps",
			"versions upload",
		],
		status: "skip",
		names: [
			"--upload-source-maps overrides config",
			"uses config.upload_source_maps when CLI flag not provided",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('deploy helpers')",
			"keep_vars behavior",
			"deploy",
		],
		status: "skip",
		names: [
			"without --keep-vars, keepVars is not set",
			"--keep-vars alone enables keep_bindings",
			"config.keep_vars alone enables keep_bindings",
			"config.keep_vars wins over CLI flag",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('deploy helpers')",
			"keep_vars behavior",
			"versions upload",
		],
		status: "skip",
		names: [
			"without --keep-vars, keepVars is not set",
			"--keep-vars alone enables keep_bindings",
			"config.keep_vars=true adds plain_text and json to keep_bindings",
			"config.keep_vars=false still includes secret types but not plain_text/json",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('deploy helpers')",
			"non-versioned settings",
			"versions upload",
		],
		status: "skip",
		names: [
			"logpush and observability are excluded from upload metadata",
			"tail_consumers is included in upload metadata",
		],
	},
	{
		file: "deploy/config-args-merging.test.ts",
		ancestors: [
			"config/args merging ('deploy helpers')",
			"non-versioned settings",
			"deploy",
		],
		status: "skip",
		names: [
			"logpush is patched via non-versioned settings",
			"observability is patched via non-versioned settings",
		],
	},
	{
		file: "deploy/inconsistent-exports.test.ts",
		ancestors: ["renderInconsistentExportsAcrossVersionsError"],
		status: "todo",
		names: [
			"preserves the server message and appends actionable next-steps",
			"includes the server message verbatim at the top of the rendered output",
			"links to the gradual-deployments docs page for Durable Objects",
		],
	},
	{
		file: "dev/get-local-persistence-path.test.ts",
		ancestors: ["getLocalPersistencePath", "when persistence is disabled"],
		status: "skip",
		names: ["should return `false` when `persistTo` is `false`"],
	},
	{
		file: "dev/get-local-persistence-path.test.ts",
		ancestors: [
			"getLocalPersistencePath",
			"when persistence is enabled with default path",
		],
		status: "skip",
		names: [
			"should return `.wrangler/state` relative to cwd when no config path",
			"should return `.wrangler/state` relative to config file directory",
		],
	},
	{
		file: "dev/get-local-persistence-path.test.ts",
		ancestors: [
			"getLocalPersistencePath",
			"when persistence path is explicitly specified",
		],
		status: "skip",
		names: [
			"should resolve relative path from cwd",
			"should resolve absolute path from cwd",
			"should resolve relative path from cwd even when config path is set",
		],
	},
	{
		file: "get-entry.test.ts",
		ancestors: ["getEntry()"],
		status: "skip",
		names: [
			"--script index.ts",
			"--script src/index.ts",
			"main = index.ts",
			"main = src/index.ts",
			"main = src/index.ts w/ configPath",
		],
	},
	{
		file: "middleware.scheduled.test.ts",
		ancestors: ["run scheduled events with middleware", "module workers"],
		status: "skip",
		names: [
			"should not intercept when middleware is not enabled",
			"should intercept when middleware is enabled",
			"should not trigger scheduled event on wrong route",
			"should respond with 404 for favicons",
			"should not respond with 404 for favicons if user-worker has a response",
		],
	},
	{
		file: "middleware.scheduled.test.ts",
		ancestors: ["run scheduled events with middleware", "service workers"],
		status: "skip",
		names: [
			"should not intercept when middleware is not enabled",
			"should intercept when middleware is enabled",
			"should not trigger scheduled event on wrong route",
			"should respond with 404 for favicons",
			"should not respond with 404 for favicons if user-worker has a response",
		],
	},
	{
		file: "pages/pages-build-env.test.ts",
		ancestors: ["pages build env"],
		status: "skip",
		names: [
			"should render empty object",
			"should fail with no project dir",
			"should fail with no outfile",
			"should exit with specific exit code if no config file is found",
			"should exit with specific code if a non-pages config file is found",
			"should exit correctly with an unparseable non-pages config file",
			"should exit correctly with a non-pages config file w/ invalid environment",
			"should throw an error if an invalid pages config file is found",
			"should exit if an unparseable pages config file is found",
			"should return top-level by default",
			"should return top-level by default (json)",
			"should return production",
			"should return preview",
			"should render output directory path relative to project directory, even if wrangler config is redirected",
		],
	},
	{
		file: "pages/utf8-truncation.test.ts",
		ancestors: ["truncateUtf8Bytes"],
		status: "skip",
		names: [
			"should not truncate strings under the limit",
			"should not truncate strings exactly at the limit",
			"should truncate ASCII strings over the limit",
			"should handle Cyrillic characters (2 bytes each)",
			"should handle long Cyrillic text",
			"should handle Japanese characters (3 bytes each)",
			"should handle emoji (4 bytes each)",
			"should not split multi-byte UTF-8 sequences",
			"should handle continuation bytes at boundary",
			"should handle mixed ASCII and multi-byte characters",
			"should handle empty string",
			"should handle single multi-byte character at boundary",
			"should preserve valid UTF-8 structure",
			"should handle exactly 384 bytes with multi-byte chars",
			"should handle 385 bytes with multi-byte chars",
		],
	},
	{
		file: "queues/queues.test.ts",
		ancestors: ["wrangler", "queues", "list"],
		status: "todo",
		names: ["should list queues on page 1 with no --page"],
	},
	{
		file: "queues/queues.test.ts",
		ancestors: ["wrangler", "queues", "create", "wrangler.json"],
		status: "todo",
		names: [
			"should create a queue",
			"should send queue settings with delivery delay",
		],
	},
	{
		file: "queues/queues.test.ts",
		ancestors: ["wrangler", "queues", "create", "wrangler.toml"],
		status: "todo",
		names: [
			"should create a queue",
			"should send queue settings with delivery delay",
		],
	},
	{
		file: "queues/queues.test.ts",
		ancestors: ["wrangler", "queues", "update"],
		status: "todo",
		names: [
			"should update a queue with new message retention period and preserve old delivery delay",
		],
	},
	{
		file: "queues/queues.test.ts",
		ancestors: ["wrangler", "queues", "consumers", "add"],
		status: "todo",
		names: ["should add a consumer using defaults"],
	},
	{
		file: "queues/queues.test.ts",
		ancestors: ["wrangler", "queues", "http_pull consumers", "add"],
		status: "todo",
		names: [
			"should add a consumer using defaults",
			"should add a consumer using custom values",
		],
	},
	{
		file: "queues/queues.test.ts",
		ancestors: ["wrangler", "queues", "consumer list"],
		status: "skip",
		names: [
			"should show the correct help text",
			"should show empty message when queue has no consumers",
		],
	},
	{
		file: "queues/queues.test.ts",
		ancestors: ["wrangler", "queues", "consumer list"],
		status: "todo",
		names: [
			"should list both worker and http consumers",
			"should list only worker consumers when queue has no http consumers",
			"should list only http consumers when queue has no worker consumers",
			"should show error when queue does not exist",
			'should output consumers as JSON with "--json" flag',
			'should output empty array as JSON with "--json" flag when no consumers',
		],
	},
	{
		file: "queues/queues.test.ts",
		ancestors: ["wrangler", "queues", "consumer worker list"],
		status: "skip",
		names: [
			"should show the correct help text",
			"should show empty message when queue has no worker consumers",
		],
	},
	{
		file: "queues/queues.test.ts",
		ancestors: ["wrangler", "queues", "consumer worker list"],
		status: "todo",
		names: [
			"should list worker consumers",
			"should show error when queue does not exist",
			'should output worker consumers as JSON with "--json" flag',
			'should output empty array as JSON with "--json" flag when no worker consumers',
		],
	},
	{
		file: "queues/queues.test.ts",
		ancestors: ["wrangler", "queues", "consumer http list"],
		status: "skip",
		names: [
			"should show the correct help text",
			"should show empty message when queue has no http consumers",
		],
	},
	{
		file: "queues/queues.test.ts",
		ancestors: ["wrangler", "queues", "consumer http list"],
		status: "todo",
		names: [
			"should list http consumers",
			"should show error when queue does not exist",
			'should output http consumers as JSON with "--json" flag',
			'should output empty array as JSON with "--json" flag when no http consumers',
		],
	},
	{
		file: "queues/queues.test.ts",
		ancestors: ["wrangler", "queues", "info"],
		status: "todo",
		names: [
			"should return queue info with worker producers when the queue has workers configured as producers",
		],
	},
	{
		file: "queues/queues.test.ts",
		ancestors: ["wrangler", "purge"],
		status: "todo",
		names: [
			"allows purge with the --force flag in non-interactive mode",
			"allows purge with correct confirmation in interactive mode",
		],
	},
	{
		file: "unstable-get-miniflare-worker-options.test.ts",
		ancestors: [
			"unstable_getMiniflareWorkerOptions",
			"zone derivation (used for the outbound CF-Worker header)",
		],
		status: "skip",
		names: [
			"derives the zone from a single `route` string",
			"uses the first entry in `routes`, preferring its `zone_name`",
			"falls back to the pattern hostname when `zone_name` is absent",
			"uses `zone_name` for unparseable patterns like `*/*`",
			"ignores `dev.host` (the `dev` config block is `wrangler dev`-only)",
			"derives the zone from `routes` even when `dev.host` is also set",
			"returns undefined when no routes are configured",
		],
	},
	{
		file: "unstable-get-miniflare-worker-options.test.ts",
		ancestors: [
			"unstable_getMiniflareWorkerOptions",
			"Cloudflare Access local dev simulation (`ctx.access`)",
		],
		status: "skip",
		names: [
			"passes `access.dev` through to the Miniflare worker options",
			"leaves `access` undefined when no `access` config is present",
		],
	},
	{
		file: "unstable-get-miniflare-worker-options.test.ts",
		ancestors: ["unstable_getMiniflareWorkerOptions", "workflow bindings"],
		status: "skip",
		names: [
			"drops deploy-only workflow fields that the local runtime has no concept of",
		],
	},
	{
		file: "unstable-get-miniflare-worker-options.test.ts",
		ancestors: [
			"unstable_getMiniflareWorkerOptions",
			"typed services bindings with `dev.plugin`",
		],
		status: "skip",
		names: [
			"routes a typed service binding with `dev.plugin` to miniflare's unsafe-binding plugin pathway",
			"leaves a typed service binding without `dev` on the regular service-binding pathway",
		],
	},
	{
		file: "utils/log-file.test.ts",
		ancestors: ["appendToDebugLogFile"],
		status: "skip",
		names: [
			"should strip ANSI escape codes from error messages",
			"should strip complex ANSI escape sequences",
			"should preserve plain messages without ANSI codes",
			"should handle multiline messages with ANSI codes",
			"should maintain timestamp and log level formatting",
			"should handle empty messages",
			"should handle messages with only ANSI codes",
		],
	},
	{
		file: "utils/log-file.test.ts",
		ancestors: ["cleanupOldLogFiles"],
		status: "skip",
		names: [
			"should delete log files older than 30 days by default",
			"should not delete non-wrangler log files",
			"should keep wrangler log files whose name has no parseable timestamp",
			"should silently succeed if the logs directory does not exist",
		],
	},
	{
		file: "utils/log-file.test.ts",
		ancestors: ["tryCleanupLogs"],
		status: "skip",
		names: [
			"should skip cleanup when WRANGLER_LOG_PATH points to an exact .log file",
			"should not throw when called",
		],
	},
] as const;

function register(group: (typeof groups)[number], depth = 0): void {
	const ancestor = group.ancestors[depth];
	if (ancestor !== undefined) {
		describe(ancestor, () => register(group, depth + 1));
		return;
	}
	for (const name of group.names) {
		if (group.status === "todo") {
			it.todo(name);
		} else {
			it.skip(name);
		}
	}
}

for (const group of groups) {
	register(group);
}
