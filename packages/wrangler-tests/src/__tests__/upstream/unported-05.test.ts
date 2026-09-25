// Generated from cloudflare/workers-sdk@c2bb4c815. Do not rename cases.
import { describe, it } from "vite-plus/test";

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
		file: "artifacts.test.ts",
		ancestors: ["artifacts", "namespaces"],
		status: "todo",
		names: ["should show help for namespace commands"],
	},
	{
		file: "artifacts.test.ts",
		ancestors: ["artifacts", "namespaces"],
		status: "skip",
		names: [
			"should list namespaces in human mode",
			"should get a namespace in human mode",
		],
	},
	{
		file: "artifacts.test.ts",
		ancestors: ["artifacts", "repos"],
		status: "todo",
		names: [
			"should show help for repo commands",
			"should require --namespace for repo commands",
			"should create a repo with JSON output",
			"should list repos with JSON output",
			"should delete a repo with JSON output",
			"should cancel repo deletion when not confirmed",
			"should reject invalid token TTL",
			"should issue a repo token with JSON output",
		],
	},
	{
		file: "artifacts.test.ts",
		ancestors: ["artifacts", "repos"],
		status: "skip",
		names: [
			"should create a repo in human mode without sending secrets through the logger",
			"should get a repo in human mode",
			"should issue a repo token in human mode without sending plaintext through the logger",
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
		file: "core/command-registration.test.ts",
		ancestors: ["CommandRegistry"],
		status: "skip",
		names: [
			"can define a command",
			"throws on duplicate command definition",
			"can define a namespace",
			"can alias a command",
			"throws on alias to undefined command",
			"throws on missing namespace definition",
			"correctly resolves definition chain for alias",
			"can resolve a command definition with its metadata",
			"correctly resolves multiple alias chains",
			"throws on invalid namespace resolution (namespace not defined)",
		],
	},
	{
		file: "d1/execute.test.ts",
		ancestors: ["execute", "duration formatting"],
		status: "todo",
		names: [
			"should preserve quoted CRLF when normalizing commands sent to the remote query API",
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
			"--route with --zone overrides config.routes with zone_name routes",
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
			"--route with --zone overrides config.routes with zone_name routes",
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
		file: "dev/create-worker-preview.test.ts",
		ancestors: ["Worker-scoped preview sessions"],
		status: "skip",
		names: [
			"uploads static assets without account-level subdomain access",
			"falls back to the account subdomain for legacy session responses",
			"preserves the endpoint and host for zone previews",
		],
	},
	{
		file: "find-additional-modules.test.ts",
		ancestors: ["traverse module graph"],
		status: "skip",
		names: [
			"should not detect JS without module rules",
			"should detect JS as ESModule",
			"should detect JS as CommonJS",
			"should not resolve JS outside the module root",
			"should resolve JS with module root",
			"should ignore files not matched by glob",
			"should ignore Wrangler files",
			"should resolve files that match the default rules",
			"should not error when a discovered file matches a rule that was shadowed by a previous rule of the same type",
			"should silently skip a discovered file that only matches a shadowed rule (issue #14257)",
		],
	},
	{
		file: "find-additional-modules.test.ts",
		ancestors: ["Python modules"],
		status: "skip",
		names: [
			"should find python_modules with forward slashes (for cross-platform deploy)",
			"should exclude files matching pythonModulesExcludes patterns",
			"should register .mjs and .js files in workers/ as esm type",
		],
	},
	{
		file: "logout.test.ts",
		ancestors: ["logout"],
		status: "skip",
		names: [
			"should clear a cached temporary preview account when not logged in via OAuth",
		],
	},
	{
		file: "logout.test.ts",
		ancestors: ["logout"],
		status: "todo",
		names: [
			"should clear the keyring entry, the encrypted file, and any plaintext TOML when keyring storage is active",
		],
	},
	{
		file: "pages/deploy.test.ts",
		ancestors: ["pages deploy"],
		status: "skip",
		names: [
			"should be aliased with 'wrangler pages deploy'",
			"should include the account name in the error when it is available in cache",
			"should suggest `wrangler deploy` if a Workers config is detected when deploying to a non-existent Pages project",
		],
	},
	{
		file: "pages/deploy.test.ts",
		ancestors: ["pages deploy"],
		status: "todo",
		names: [
			"should error if no `[<directory>]` arg is specified in the `pages deploy` command",
			"should error if no `[--project-name]` is specified",
			"does not delegate an unnamed agent deploy when autoconfig would infer an existing Pages project name",
			"ignores a cached project name from a different account and does not delegate",
			"keeps a cache-revived project on Pages after an account-only cache update",
			"should error if the specified project does not exist in non-interactive mode",
			"should error if the [--config] command line arg was specififed",
			"should error if the [--env] command line arg was specififed",
			"should upload a directory of files",
			"should retry uploads",
			"should retry POST /deployments",
			"should retry GET /deployments/:deploymentId",
			"should refetch a JWT if it expires while uploading",
			"should try to use multiple buckets (up to the max concurrency)",
			"should resolve child directories correctly",
			"should resolve the current directory correctly",
			"should not error when directory names contain periods and houses a extensionless file",
			"preserves preview semantics for an interactive agent creating a new project with --branch",
			"should not error when deploying a new project with a new repo",
		],
	},
	{
		file: "pages/deploy.test.ts",
		ancestors: ["pages deploy", "with Pages Functions"],
		status: "todo",
		names: [
			"should upload a Functions project",
			"should upload _routes.json for Functions projects, if provided",
			"should not deploy Functions projects that provide an invalid custom _routes.json file",
			"should surface a clear error when _routes.json contains invalid JSON (Functions)",
			"should fail with the appropriate error message, if the deployment of the project failed",
		],
	},
	{
		file: "pages/deploy.test.ts",
		ancestors: ["pages deploy", "with Pages Functions"],
		status: "skip",
		names: ["should bundle Functions and resolve its external module imports"],
	},
	{
		file: "pages/deploy.test.ts",
		ancestors: ["pages deploy", "in Advanced Mode [_worker,js]"],
		status: "todo",
		names: [
			"should upload an Advanced Mode project",
			"should upload _routes.json for Advanced Mode projects, if provided",
			"should not deploy Advanced Mode projects that provide an invalid _routes.json file",
			"should surface a clear error when _routes.json contains invalid JSON (Advanced Mode)",
			"should ignore the entire /functions directory if _worker.js is provided",
			"should fail with the appropriate logs, if the deployment of the project failed",
		],
	},
	{
		file: "pages/deploy.test.ts",
		ancestors: ["pages deploy", "in Advanced Mode [_worker,js]"],
		status: "skip",
		names: [
			"should bundle _worker.js and resolve its external module imports",
			"should error with --no-bundle and a single _worker.js file",
			"should not error with --no-bundle and an index.js in a _worker.js/ directory",
		],
	},
	{
		file: "pages/deploy.test.ts",
		ancestors: ["pages deploy", "with wrangler.json configuration"],
		status: "skip",
		names: [
			"should support wrangler.json",
			"should error if user attempts to specify a custom config file path",
			"should warn and ignore the config file, if it doesn't specify the `pages_build_output_dir` field",
			"should always deploy to the Pages project specified by the top-level `name` configuration field, regardless of the corresponding env-level configuration",
		],
	},
	{
		file: "pages/deploy.test.ts",
		ancestors: ["pages deploy", "with wrangler.toml configuration"],
		status: "skip",
		names: [
			"should support wrangler.toml",
			"should error if user attempts to specify a custom config file path",
			"should warn and ignore the config file, if it doesn't specify the `pages_build_output_dir` field",
			"should always deploy to the Pages project specified by the top-level `name` configuration field, regardless of the corresponding env-level configuration",
		],
	},
	{
		file: "pages/deploy.test.ts",
		ancestors: ["pages deploy", "_worker.js bundling"],
		status: "skip",
		names: [
			"should bundle the _worker.js when both `--bundle` and `--no-bundle` are omitted",
			"should not bundle the _worker.js when `--no-bundle` is set",
			"should not allow 3rd party imports when not bundling",
			"should allow `cloudflare:...` imports when not bundling",
			"should allow `node:...` imports when not bundling and marked with nodejs_compat",
			"should not allow `node:...` imports when not bundling and not marked nodejs_compat",
			"should not bundle the _worker.js when `--bundle` is set to false",
			"should bundle the _worker.js when the `--no-bundle` is set to false",
			"should bundle the _worker.js when the `--bundle` is set to true",
		],
	},
	{
		file: "pages/deploy.test.ts",
		ancestors: ["pages deploy", "_worker.js directory bundling"],
		status: "skip",
		names: [
			"should not bundle the _worker.js when `no_bundle = true` in Wrangler config: wrangler.json",
			"should not bundle the _worker.js when `no_bundle = true` in Wrangler config: wrangler.toml",
		],
	},
	{
		file: "pages/deploy.test.ts",
		ancestors: ["pages deploy", "source maps"],
		status: "todo",
		names: [
			"should upload sourcemaps for functions directory projects",
			"should upload sourcemaps for _worker.js file projects",
			"should upload sourcemaps for _worker.js directory projects",
		],
	},
	{
		file: "pages/deploy.test.ts",
		ancestors: ["pages deploy", "deployment aliases"],
		status: "skip",
		names: [
			"should support outputting an alias url",
			"ignores custom domains",
			"continues to work fine if no aliases",
		],
	},
	{
		file: "pages/deploy.test.ts",
		ancestors: ["pages deploy", "deploys with custom commit information"],
		status: "todo",
		names: ["should accept and send --commit-hash parameter"],
	},
	{
		file: "pages/deploy.test.ts",
		ancestors: ["pages deploy", "git detection debug logging"],
		status: "skip",
		names: [
			"should output debug logs for git detection when WRANGLER_LOG=debug",
			"should log git summary even when flags are provided outside a git repo",
		],
	},
	{
		file: "pages/deploy.test.ts",
		ancestors: ["pages deploy", "deploys using redirected configs"],
		status: "todo",
		names: [
			"should work without a branch specified (i.e. defaulting to the production environment)",
			"should work with the main branch (i.e. the production environment)",
			"should work with any branch (i.e. the preview environment)",
		],
	},
	{
		file: "pages/deploy.test.ts",
		ancestors: ["pages deploy", "max file count limit from JWT"],
		status: "todo",
		names: [
			"should error when file count exceeds limit from JWT",
			"should respect higher file count limit from JWT",
		],
	},
	{
		file: "pages/deploy.test.ts",
		ancestors: ["pages deploy", "account id resolution"],
		status: "skip",
		names: [
			"should prefer the CLOUDFLARE_ACCOUNT_ID environment variable over a stale cached account id in pages.json",
		],
	},
	{
		file: "pages/deploy.test.ts",
		ancestors: ["getUnsupportedDeployDelegateArgs"],
		status: "todo",
		names: [
			"treats --branch as unsupported so preview deploys stay on Pages",
			"still reports git-integration metadata and --skip-caching as unsupported",
			"ignores boolean flags left at false",
		],
	},
	{
		file: "pages/project-upload.test.ts",
		ancestors: ["pages project upload"],
		status: "todo",
		names: [
			"should upload a directory of files with a provided JWT",
			"should avoid uploading some files",
			"should retry uploads",
			"should retry uploads after gateway failures",
			"should try to use multiple buckets (up to the max concurrency)",
			"should handle a very large number of assets",
			"should not error when directory names contain periods and houses a extensionless file",
		],
	},
	{
		file: "pages/project-upload.test.ts",
		ancestors: ["maxFileCountAllowedFromClaims"],
		status: "todo",
		names: [
			"should return the value from max_file_count_allowed claim when present",
			"should return default value when max_file_count_allowed is not a number",
			"should return default value when JWT does not have max_file_count_allowed claim",
			"should return default value for test tokens without parsing",
			"should throw error for invalid JWT format",
		],
	},
	{
		file: "preview/containers.test.ts",
		ancestors: ["deployPreviewContainers"],
		status: "skip",
		names: [
			"should lowercase the image repository name while preserving the application name",
			"should lowercase an uppercase preview slug in the image repository name",
			"should forward the compliance region to the image build",
			"should ignore a cross-script Durable Object binding that shares a class name",
			"should not build an image for a container configured with an image URI",
			"should push a locally built Build Output image before applying it",
			"should keep warnings on stderr while suppressing stdout",
		],
	},
	{
		file: "templates/__tests__/pages-dev-util.test.ts",
		ancestors: ["isRoutingRuleMatch"],
		status: "skip",
		names: [
			"should match rules referencing root level correctly",
			"should match include-all rules correctly",
			"should match `/*` suffix-ed rules correctly",
			"should match `/` suffix-ed rules correctly",
			"should match `*` suffix-ed rules correctly",
			"should match rules without wildcards correctly",
			"should throw an error if pathname or routing rule params are missing",
		],
	},
	{
		file: "utils/debounce.test.ts",
		ancestors: ["debounce"],
		status: "skip",
		names: [
			"invokes the function once after the delay has elapsed",
			"collapses a burst of calls into a single invocation",
			"starts a new delay for calls made after an invocation",
			"cancel() discards a pending invocation",
			"cancel() does not prevent later invocations",
			"cancel() is a no-op when nothing is pending",
		],
	},
	{
		file: "whoami.test.ts",
		ancestors: ["whoami"],
		status: "skip",
		names: [
			"should suggest a temporary preview account when not authenticated",
		],
	},
	{
		file: "whoami.test.ts",
		ancestors: ["whoami"],
		status: "todo",
		names: ["should fail when /memberships fails with a non-tolerated error"],
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
