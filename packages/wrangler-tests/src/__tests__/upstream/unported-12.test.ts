// Generated from cloudflare/workers-sdk@93d72a577. Do not rename cases.
import { describe, it } from "vitest";

const groups = [
	{
		file: "api/startDevWorker/ProxyController.test.ts",
		ancestors: ["ProxyController"],
		status: "skip",
		names: ["Runtime.exceptionThrown dispatches a typed runtimeError event"],
	},
	{
		file: "cert.test.ts",
		ancestors: ["wrangler", "cert", "api", "uploadMTlsCertificate"],
		status: "todo",
		names: ["should call mtls_certificates upload endpoint"],
	},
	{
		file: "cert.test.ts",
		ancestors: ["wrangler", "cert", "api", "uploadMTlsCertificateFromFs"],
		status: "todo",
		names: [
			"should fail to read cert and key files when missing",
			"should read cert and key from disk and call mtls_certificates upload endpoint",
		],
	},
	{
		file: "cert.test.ts",
		ancestors: ["wrangler", "cert", "api", "uploadCaCertificateFromFs"],
		status: "todo",
		names: [
			"should fail to read ca cert when file is missing",
			"should read ca cert from disk and call mtls_certificates upload endpoint",
		],
	},
	{
		file: "cert.test.ts",
		ancestors: ["wrangler", "cert", "api", "listMTlsCertificates"],
		status: "todo",
		names: ["should call mtls_certificates list endpoint"],
	},
	{
		file: "cert.test.ts",
		ancestors: ["wrangler", "cert", "api", "getMTlsCertificate"],
		status: "todo",
		names: ["calls get mtls_certificates endpoint"],
	},
	{
		file: "cert.test.ts",
		ancestors: ["wrangler", "cert", "api", "getMTlsCertificateByName"],
		status: "todo",
		names: [
			"calls list mtls_certificates endpoint with name",
			"errors when a certificate cannot be found",
			"errors when multiple certificates are found",
		],
	},
	{
		file: "cert.test.ts",
		ancestors: ["wrangler", "cert", "api", "deleteMTlsCertificate"],
		status: "todo",
		names: ["calls delete mts_certificates endpoint"],
	},
	{
		file: "cert.test.ts",
		ancestors: ["wrangler", "cert", "commands", "help"],
		status: "todo",
		names: ["should show the correct help text"],
	},
	{
		file: "cert.test.ts",
		ancestors: ["wrangler", "cert", "commands", "delete"],
		status: "todo",
		names: [
			"should require --id or --name",
			"should require not providing --id and --name",
			"should delete certificate by name",
			"should not delete when certificate cannot be found by name",
			"should not delete when many certificates are found by name",
		],
	},
	{
		file: "cloudchamber/delete.test.ts",
		ancestors: ["cloudchamber delete"],
		status: "todo",
		names: [
			"should help",
			"should delete deployment (detects no interactivity)",
			"can't modify delete due to lack of fields",
		],
	},
	{
		file: "config/loadDotEnv.test.ts",
		ancestors: ["loadDotEnv()"],
		status: "skip",
		names: [
			"should load environment variables from .env files",
			"should support silent processing",
			"should debug log if .env files are missing",
			"should have case sensitive env properties",
			"should have case insensitive env properties",
			"should include process.env variables if specified",
		],
	},
	{
		file: "d1/create.test.ts",
		ancestors: ["create"],
		status: "skip",
		names: ["should throw if local flag is provided"],
	},
	{
		file: "d1/create.test.ts",
		ancestors: ["create"],
		status: "todo",
		names: [
			"should show all supported jurisdictions in help",
			"should show a user-friendly error when database limit is reached",
		],
	},
	{
		file: "deploy/binding-depends-on-export.test.ts",
		ancestors: ["renderBindingDependsOnExportError"],
		status: "todo",
		names: [
			"surfaces the EWC server message verbatim",
			"trims surrounding whitespace from the server message",
			"falls back to a generic actionable message when the server message is empty",
		],
	},
	{
		file: "deploy/environments.test.ts",
		ancestors: ["deploy", "--dry-run"],
		status: "todo",
		names: ["should not deploy the worker if --dry-run is specified"],
	},
	{
		file: "deploy/environments.test.ts",
		ancestors: ["deploy", "--keep-vars"],
		status: "todo",
		names: [
			"should send keepVars when keep-vars is passed in",
			"should not send keepVars by default",
			"should send keepVars when `keep_vars = true`",
		],
	},
	{
		file: "deploy/environments.test.ts",
		ancestors: ["deploy", "--dispatch-namespace"],
		status: "todo",
		names: ["should upload to dispatch namespace"],
	},
	{
		file: "deploy/environments.test.ts",
		ancestors: ["deploy", "[observability]"],
		status: "todo",
		names: [
			"should allow uploading workers with observability",
			"should allow uploading workers with nested observability logs setting",
			"should allow uploading workers with nested observability traces setting",
			"should disable observability if not explicitly defined",
		],
	},
	{
		file: "deploy/environments.test.ts",
		ancestors: ["deploy", "compliance region support"],
		status: "todo",
		names: [
			"should upload to the public region by default",
			"should upload to the FedRAMP High region if set in config",
			"should upload to the FedRAMP High region if set in an env var",
			"should error if the region is set in both env var and configured, and they conflict",
			"should not error if the region is set in both env var and configured, and they are the same",
		],
	},
	{
		file: "deploy/environments.test.ts",
		ancestors: ["deploy", "Service and environment tagging"],
		status: "skip",
		names: [
			"has environments, no existing tags, top-level env",
			"has environments, no existing tags, named env",
			"has environments, missing tags, top-level env",
			"has environments, missing tags, named env",
			"has environments, missing environment tag, named env",
			"has environments, stale service tag, top-level env",
			"has environments, stale service tag, named env",
			"has environments, stale environment tag, top-level env",
			"has environments, stale environment tag, named env",
			"has environments, has expected tags, top-level env",
			"has environments, has expected tags, named env",
			"no environments",
			"no top-level name",
			"displays warning when error updating tags",
			"environments with redirected config",
		],
	},
	{
		file: "deploy/environments.test.ts",
		ancestors: ["deploy", "multi-env warning"],
		status: "skip",
		names: [
			"should warn if the wrangler config contains environments but none was specified in the command",
			"should not warn if the wrangler config contains environments and one was specified in the command",
			"should not warn if the wrangler config doesn't contain environments and none was specified in the command",
			'should not warn if --env="" is passed to explicitly target the top-level environment',
			"should not warn if the wrangler config contains environments and CLOUDFLARE_ENV is set",
			"should not warn if using a redirected wrangler config with a baked-in target environment",
			"should not warn if using a redirected wrangler config targeting the top-level environment (no targetEnvironment set)",
		],
	},
	{
		file: "deploy/environments.test.ts",
		ancestors: ["deploy", "--tag and --message"],
		status: "todo",
		names: [
			"should send tag and message annotations via the new versions API",
			"should send tag and message annotations via the legacy PUT API",
			"should send only --tag without --message",
			"should send only --message without --tag",
			"should not set annotations when neither --tag nor --message is provided",
		],
	},
	{
		file: "deploy/workers-dev.test.ts",
		ancestors: ["deploy", "workers_dev defaults"],
		status: "todo",
		names: [
			"'workers_dev=undefined, routes empty'",
			"'workers_dev=undefined, routes populat…'",
			"'workers_dev override, routes empty'",
			"'workers_dev override, routes populated'",
			"'preview_urls=undefined, workers_dev=d…'",
			"'preview_urls=undefined, workers_dev=d…'",
			"'preview_urls=undefined, workers_dev=e…'",
			"'preview_urls override'",
		],
	},
	{
		file: "deploy/workers-dev.test.ts",
		ancestors: ["deploy", "workers_dev setting"],
		status: "todo",
		names: [
			"should include Cloudflare-Workers-Script-Api-Date header",
			"should deploy to a workers.dev domain if workers_dev is undefined",
			"should deploy successfully if the /subdomain POST request is flaky",
			"should deploy to the workers.dev domain if workers_dev is `true`",
			"should not try to enable the workers.dev domain if it has been enabled before and previews are in sync",
			"should sync the workers.dev domain if it has been enabled before but previews should be enabled",
			"should sync the workers.dev domain if it has been enabled before but previews should be enabled",
			"should disable the workers.dev domain if workers_dev is `false`",
			"should not try to disable the workers.dev domain if it is not already available and previews are in sync",
			"should sync the workers.dev domain if it is not available but previews should be enabled",
			"should sync the workers.dev domain if it is not available but previews should be disabled",
			"should use the command line --compatibility-date and --compatibility-flags if they are specified",
			"should enable the workers.dev domain if workers_dev is undefined and subdomain is not already available",
			"should enable the workers.dev domain if workers_dev is true and subdomain is not already available",
			"should fail to deploy to the workers.dev domain if email is unverified",
			"should offer to create a new workers.dev subdomain when publishing to workers_dev without one",
			"should not deploy to workers.dev if there are any routes defined",
			"can deploy to both workers.dev and routes if both defined",
		],
	},
	{
		file: "deploy/workers-dev.test.ts",
		ancestors: ["deploy", "workers_dev setting"],
		status: "skip",
		names: [
			"should disable the workers.dev domain if workers_dev is undefined but overwritten to `false` in environment",
			"should disable the workers.dev domain if workers_dev is `true` but overwritten to `false` in environment",
			"should deploy to a workers.dev domain if workers_dev is undefined but overwritten to `true` in environment",
			"should deploy to a workers.dev domain if workers_dev is `false` but overwritten to `true` in environment",
			"should use the global compatibility_date and compatibility_flags if they are not overwritten by the environment",
			"should use the environment specific compatibility_date and compatibility_flags",
			"should error if a compatibility_date is not available in wrangler.toml or cli args",
			"should error if a compatibility_date is missing and suggest the correct date",
			"should not deploy to workers.dev if there are any routes defined (environments)",
			"should not deploy to workers.dev if there are any routes defined (only in environments)",
			"can deploy to both workers.dev and routes if both defined (environments: 1)",
			"can deploy to both workers.dev and routes if both defined (environments: 2)",
			"will deploy only to routes when workers_dev is false (environments 1) ",
			"will deploy only to routes when workers_dev is false (environments 2) ",
			"should warn the user if workers_dev default is different from remote",
			"should warn the user if preview_urls default is different from remote",
		],
	},
	{
		file: "deploy/workers-dev.test.ts",
		ancestors: [
			"deploy",
			"workers_dev setting",
			"brand-new account / first deploy (no workers.dev subdomain yet)",
		],
		status: "todo",
		names: [
			"registers a workers.dev subdomain before uploading a new Worker",
			"fails before uploading when the user declines to register a subdomain",
			"uploads a new Worker without prompting when the account already has a subdomain",
			"does not check for a workers.dev subdomain when a new Worker only targets routes",
			"does not check for a workers.dev subdomain when a new Worker sets workers_dev = false",
		],
	},
	{
		file: "deploy/workers-dev.test.ts",
		ancestors: [
			"deploy",
			"workers_dev setting",
			"brand-new account / first deploy (no workers.dev subdomain yet)",
		],
		status: "skip",
		names: ["uses the project name without prompting when run by an agent"],
	},
	{
		file: "deploy/workers-dev.test.ts",
		ancestors: ["deploy", "workers_dev mixed state warnings"],
		status: "skip",
		names: ["should not warn when config is the same as remote"],
	},
	{
		file: "deploy/workers-dev.test.ts",
		ancestors: ["deploy", "workers_dev mixed state warnings"],
		status: "todo",
		names: [
			"should not warn when workers_dev=false,preview_urls=false",
			"should not warn when workers_dev=true,preview_urls=true",
			"should warn when workers_dev=false,preview_urls=true",
			"should warn when workers_dev=true,preview_urls=false",
		],
	},
	{
		file: "experimental-config/convert.test.ts",
		ancestors: ["convertToolingConfig", "empty input"],
		status: "skip",
		names: [
			"returns an empty object for an empty config",
			"omits keys for undefined input fields rather than emitting `undefined` values",
		],
	},
	{
		file: "experimental-config/convert.test.ts",
		ancestors: [
			"convertToolingConfig",
			"camelCase → snake_case top-level mappings",
		],
		status: "skip",
		names: [
			"maps noBundle to no_bundle",
			"passes minify through unchanged",
			"maps keepNames to keep_names",
			"passes alias through unchanged",
			"passes define through unchanged",
			"maps findAdditionalModules to find_additional_modules",
			"maps preserveFileNames to preserve_file_names",
			"maps baseDir to base_dir",
			"passes rules through unchanged",
			"maps wasmModules to wasm_modules",
			"maps textBlobs to text_blobs",
			"maps dataBlobs to data_blobs",
			"passes tsconfig through unchanged",
			"maps jsxFactory to jsx_factory",
			"maps jsxFragment to jsx_fragment",
			"maps uploadSourceMaps to upload_source_maps",
			"maps sendMetrics to send_metrics",
		],
	},
	{
		file: "experimental-config/convert.test.ts",
		ancestors: ["convertToolingConfig", "pythonModules"],
		status: "skip",
		names: [
			"maps to python_modules with exclude preserved",
			"passes an empty pythonModules object through as python_modules: {}",
			"preserves an explicit empty exclude array",
		],
	},
	{
		file: "experimental-config/convert.test.ts",
		ancestors: ["convertToolingConfig", "build"],
		status: "skip",
		names: [
			"maps watchDir to watch_dir (string form)",
			"maps watchDir to watch_dir (array form)",
			"emits build with undefined sub-fields when only watchDir is provided",
		],
	},
	{
		file: "experimental-config/convert.test.ts",
		ancestors: ["convertToolingConfig", "dev"],
		status: "skip",
		names: [
			"maps every renamed sub-field",
			"does NOT map dev.types into the output (consumed separately)",
			"emits dev with undefined sub-fields for absent options",
		],
	},
	{
		file: "experimental-config/convert.test.ts",
		ancestors: ["convertToolingConfig", "assetsDirectory"],
		status: "skip",
		names: [
			"maps to assets.directory",
			"does not emit `assets` when assetsDirectory is absent",
		],
	},
	{
		file: "experimental-config/convert.test.ts",
		ancestors: ["convertToolingConfig", "composite"],
		status: "skip",
		names: ["maps a fully populated config in a single pass"],
	},
	{
		file: "logger.test.ts",
		ancestors: ["logger"],
		status: "skip",
		names: ["should add colored markers to error and warning messages"],
	},
	{
		file: "logger.test.ts",
		ancestors: ["logger", "loggerLevel=debug"],
		status: "skip",
		names: [
			"should render messages that are at or above the log level set in the logger",
		],
	},
	{
		file: "logger.test.ts",
		ancestors: ["logger", "loggerLevel=log"],
		status: "skip",
		names: [
			"should render messages that are at or above the log level set in the logger",
		],
	},
	{
		file: "logger.test.ts",
		ancestors: ["logger", "loggerLevel=warn"],
		status: "skip",
		names: [
			"should render messages that are at or above the log level set in the logger",
		],
	},
	{
		file: "logger.test.ts",
		ancestors: ["logger", "loggerLevel=error"],
		status: "skip",
		names: [
			"should render messages that are at or above the log level set in the logger",
		],
	},
	{
		file: "logger.test.ts",
		ancestors: ["logger", "loggerLevelFromEnvVar=error"],
		status: "skip",
		names: [
			"should render messages that are at or above the log level set in the env var",
		],
	},
	{
		file: "logger.test.ts",
		ancestors: ["logger", "loggerLevelFromEnvVar case-insensitive"],
		status: "skip",
		names: [
			"should render messages that are at or above the log level set in the env var",
		],
	},
	{
		file: "logger.test.ts",
		ancestors: [
			"logger",
			"loggerLevelFromEnvVar falls back to log on invalid level",
		],
		status: "skip",
		names: [
			"should render messages that are at or above the log level set in the env var",
		],
	},
	{
		file: "logger.test.ts",
		ancestors: ["logger", "once"],
		status: "skip",
		names: [
			"should only log the same message once",
			"should log once per log level",
		],
	},
	{
		file: "logger.test.ts",
		ancestors: ["logger", "@cloudflare/cli-shared-helpers logRaw"],
		status: "skip",
		names: [
			"should output at log level",
			"should not output when log level is set to warn",
			"should not output when log level is set to error",
			"should not output when log level is set to none",
			"should output when log level is set to debug",
		],
	},
	{
		file: "logger.test.ts",
		ancestors: ["logger", "@cloudflare/cli-shared-helpers error"],
		status: "skip",
		names: [
			"should output at error level",
			"should not output when log level is set to none",
			"should output when log level is set to warn",
			"should output when log level is set to log",
			"should output when log level is set to debug",
		],
	},
	{
		file: "logger.test.ts",
		ancestors: ["shouldLogToDisk"],
		status: "skip",
		names: [
			"should return false in test environments by default",
			"should return true outside test environments when WRANGLER_WRITE_LOGS is not set",
			"should return false when WRANGLER_WRITE_LOGS=false",
			"should be case-insensitive (WRANGLER_WRITE_LOGS=FALSE)",
			"should return false when WRANGLER_WRITE_LOGS=0",
			"should return true for any other value",
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
			"should keep warnings on stderr while suppressing stdout",
		],
	},
	{
		file: "tail.test.ts",
		ancestors: ["tail", "disconnects"],
		status: "todo",
		names: [
			"retries then gives up after the connection drops (pretty format)",
			"retries then gives up after the connection drops (json format)",
			"auto-reconnects after a transient drop and continues streaming",
			"treats a missed keep-alive pong as a disconnect and reconnects",
		],
	},
	{
		file: "tail.test.ts",
		ancestors: ["tail", "shutdown"],
		status: "todo",
		names: [
			"logs `Stopping tail...`, deletes the tail, and exits cleanly on Ctrl-C",
			"shuts down cleanly when Ctrl-C is hit before the WebSocket finishes connecting",
		],
	},
	{
		file: "tail.test.ts",
		ancestors: ["tail"],
		status: "skip",
		names: [
			"should error helpfully if pages_build_output_dir is set in wrangler.toml",
		],
	},
	{
		file: "utils/detect-agent.test.ts",
		ancestors: ["detect-agent", "detectAgent()"],
		status: "skip",
		names: [
			"reports an agent (with id) when detection type is 'agent'",
			"is not an agent when type is 'hybrid', but still reports the id",
			"is not an agent when type is 'interactive'",
			"resolves to a non-agent result when detection throws",
			"detects in a single pass",
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
