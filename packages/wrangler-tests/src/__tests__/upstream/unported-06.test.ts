// Generated from cloudflare/workers-sdk@93d72a577. Do not rename cases.
import { describe, it } from "vitest";

const groups = [
	{
		file: "api/startDevWorker/BundleController.test.ts",
		ancestors: ["BundleController", "happy path bundle + watch"],
		status: "skip",
		names: [
			"single ts source file ('bundled')",
			"single ts source file ('unbundled with entrypoint processing')",
			"a watch-mode rebuild failure emits an error event and recovers",
			"multiple ts source files",
			"custom build",
			"a burst of watched file changes does not run custom builds concurrently",
			"teardown aborts an in-flight watched custom build",
			"a config update after teardown is ignored (watched custom build)",
			"a config update after teardown is ignored (unwatched custom build)",
			"a config update after teardown is ignored (esbuild bundler)",
		],
	},
	{
		file: "api/startDevWorker/BundleController.test.ts",
		ancestors: ["BundleController"],
		status: "skip",
		names: ["module aliasing"],
	},
	{
		file: "api/startDevWorker/BundleController.test.ts",
		ancestors: ["BundleController", "switching"],
		status: "skip",
		names: ["esbuild -> custom builds", "custom builds -> esbuild"],
	},
	{
		file: "api/startDevWorker/BundleController.test.ts",
		ancestors: ["BundleController", "bundling error messages"],
		status: "skip",
		names: [
			"should recommend alias when a non-Node module cannot be resolved",
			"should NOT recommend alias for Node built-in modules",
		],
	},
	{
		file: "autoconfig/index.test.ts",
		ancestors: ["autoconfig wrappers", "runAutoConfigDetection"],
		status: "todo",
		names: [
			"calls getDetailsForAutoConfig with the provided config and context, and returns the result",
			"sends detection_started then detection_completed on success",
			"sends detection_completed with error info on failure and re-throws the original error",
			"extracts frameworkId and configured from AutoConfigDetectionError",
		],
	},
	{
		file: "autoconfig/index.test.ts",
		ancestors: ["autoconfig wrappers", "runAutoConfigLogic"],
		status: "todo",
		names: [
			"calls runAutoConfig with the provided details and options, and returns the result",
			"sends configuration_started then configuration_completed on success",
			"sends configuration_completed with error info on failure and re-throws the original error",
		],
	},
	{
		file: "cli-hotkeys.test.ts",
		ancestors: ["Hot Keys", "callbacks"],
		status: "skip",
		names: [
			"calls handlers when a key is pressed",
			"handles CAPSLOCK",
			"does not fire plain key handler when ctrl or meta is also held with shift",
			"handles meta keys",
			"ignores missing key names",
			"ignores unbound keys",
			"calls handler if any additional key bindings are pressed",
			"surfaces errors in handlers",
		],
	},
	{
		file: "cli-hotkeys.test.ts",
		ancestors: ["Hot Keys", "instructions"],
		status: "skip",
		names: [
			"provides formatted instructions to Wrangler's & Miniflare's logger implementations",
			"provides stacked formatted instructions in narrow views",
			"hides options with disabled property enabled",
		],
	},
	{
		file: "complete.test.ts",
		ancestors: ["wrangler", "complete", "bash"],
		status: "skip",
		names: [
			"should reference wrangler complete",
			"should define __wrangler_complete function",
		],
	},
	{
		file: "complete.test.ts",
		ancestors: ["wrangler", "complete", "zsh"],
		status: "skip",
		names: [
			"should reference wrangler complete",
			"should define _wrangler function",
		],
	},
	{
		file: "complete.test.ts",
		ancestors: ["wrangler", "complete", "fish"],
		status: "skip",
		names: [
			"should reference wrangler complete",
			"should define __wrangler_perform_completion function",
		],
	},
	{
		file: "create-worker-upload-form/bindings.test.ts",
		ancestors: [
			"createWorkerUploadForm — bindings",
			"plain_text / json / secret_text bindings",
		],
		status: "skip",
		names: [
			"should include 'plain_text' binding in metadata",
			"should include 'json' binding in metadata",
			"should include 'secret_text' binding in metadata",
		],
	},
	{
		file: "create-worker-upload-form/bindings.test.ts",
		ancestors: ["createWorkerUploadForm — bindings", "kv_namespace bindings"],
		status: "skip",
		names: [
			"should include KV bindings with an ID",
			"should throw when KV namespace has no ID and not in dry run",
			"should convert KV namespace to inherit binding during dry run when ID is missing",
			"should convert KV namespace with INHERIT_SYMBOL to inherit binding",
		],
	},
	{
		file: "create-worker-upload-form/bindings.test.ts",
		ancestors: ["createWorkerUploadForm — bindings", "r2_bucket bindings"],
		status: "skip",
		names: [
			"should include R2 bindings with a bucket_name",
			"should throw when R2 bucket has no bucket_name and not in dry run",
			"should convert R2 bucket to inherit binding during dry run when bucket_name is missing",
		],
	},
	{
		file: "create-worker-upload-form/bindings.test.ts",
		ancestors: ["createWorkerUploadForm — bindings", "d1 bindings"],
		status: "skip",
		names: [
			"should include D1 bindings with a database_id",
			"should throw when D1 has no database_id and not in dry run",
			"should convert D1 to inherit binding during dry run when database_id is missing",
		],
	},
	{
		file: "create-worker-upload-form/bindings.test.ts",
		ancestors: [
			"createWorkerUploadForm — bindings",
			"durable_object_namespace bindings",
		],
		status: "skip",
		names: [
			"should include durable object bindings",
			"should omit optional script_name and environment when not provided",
		],
	},
	{
		file: "create-worker-upload-form/bindings.test.ts",
		ancestors: ["createWorkerUploadForm — bindings", "service bindings"],
		status: "skip",
		names: [
			"should include service bindings with optional environment and entrypoint",
		],
	},
	{
		file: "create-worker-upload-form/bindings.test.ts",
		ancestors: ["createWorkerUploadForm — bindings", "queue bindings"],
		status: "skip",
		names: ["should include queue bindings"],
	},
	{
		file: "create-worker-upload-form/bindings.test.ts",
		ancestors: ["createWorkerUploadForm — bindings", "workflow bindings"],
		status: "skip",
		names: ["should include workflow bindings"],
	},
	{
		file: "create-worker-upload-form/bindings.test.ts",
		ancestors: [
			"createWorkerUploadForm — bindings",
			"pass-through binding types",
		],
		status: "skip",
		names: [
			"should pass through 'vectorize' binding unchanged",
			"should pass through 'hyperdrive' binding unchanged",
			"should pass through 'analytics_engine' binding unchanged",
			"should pass through 'mtls_certificate' binding unchanged",
			"should pass through 'secrets_store_secret' binding unchanged",
			"should pass through 'ratelimit' binding unchanged",
			"should pass through 'ai_search_namespace' binding unchanged",
			"should pass through 'ai_search' binding unchanged",
			"should pass through 'agent_memory' binding unchanged",
			"should pass through 'inherit' binding unchanged",
		],
	},
	{
		file: "create-worker-upload-form/bindings.test.ts",
		ancestors: ["createWorkerUploadForm — bindings", "ai_search bindings"],
		status: "skip",
		names: [
			"should include ai_search binding with instance_name",
			"should include ai_search_namespace binding",
			"should throw when ai_search_namespace has no namespace and not in dry run",
			"should convert ai_search_namespace to inherit binding during dry run when namespace is missing",
		],
	},
	{
		file: "create-worker-upload-form/bindings.test.ts",
		ancestors: ["createWorkerUploadForm — bindings", "agent_memory bindings"],
		status: "skip",
		names: [
			"should include agent_memory binding with namespace",
			"should throw when agent_memory has no namespace and not in dry run",
			"should convert agent_memory to inherit binding during dry run when namespace is missing",
		],
	},
	{
		file: "create-worker-upload-form/bindings.test.ts",
		ancestors: ["createWorkerUploadForm — bindings", "pipeline bindings"],
		status: "skip",
		names: ["should transform type from pipeline to pipelines"],
	},
	{
		file: "create-worker-upload-form/bindings.test.ts",
		ancestors: ["createWorkerUploadForm — bindings", "singleton bindings"],
		status: "skip",
		names: [
			"should include 'browser' binding",
			"should include 'ai' binding",
			"should include 'images' binding",
			"should include 'stream' binding",
			"should include 'media' binding",
			"should include 'version_metadata' binding",
			"should include 'assets' binding",
		],
	},
	{
		file: "create-worker-upload-form/bindings.test.ts",
		ancestors: [
			"createWorkerUploadForm — bindings",
			"dispatch_namespace bindings",
		],
		status: "skip",
		names: [
			"should include dispatch namespace bindings",
			"should include outbound config for dispatch namespace",
		],
	},
	{
		file: "create-worker-upload-form/bindings.test.ts",
		ancestors: ["createWorkerUploadForm — bindings", "wasm_module bindings"],
		status: "skip",
		names: ["should add wasm module as a form part and metadata binding"],
	},
	{
		file: "create-worker-upload-form/bindings.test.ts",
		ancestors: ["createWorkerUploadForm — bindings", "text_blob bindings"],
		status: "skip",
		names: [
			"should add text blob as a form part and metadata binding",
			"should not add __STATIC_CONTENT_MANIFEST as a form part",
		],
	},
	{
		file: "create-worker-upload-form/bindings.test.ts",
		ancestors: ["createWorkerUploadForm — bindings", "data_blob bindings"],
		status: "skip",
		names: ["should add data blob as a form part and metadata binding"],
	},
	{
		file: "create-worker-upload-form/bindings.test.ts",
		ancestors: [
			"createWorkerUploadForm — bindings",
			"provisionable name-only bindings",
		],
		status: "skip",
		names: [
			"should inherit a draft 'Queue' binding during dry run",
			"should inherit a draft 'Dispatch Namespace' binding during dry run",
			"should inherit a draft 'Flagship' binding during dry run",
		],
	},
	{
		file: "create-worker-upload-form/bindings.test.ts",
		ancestors: [
			"createWorkerUploadForm — bindings",
			"multiple binding types together",
		],
		status: "skip",
		names: ["should handle a worker with many different binding types"],
	},
	{
		file: "deploy/config-remote.test.ts",
		ancestors: ["deploy", "config remote differences"],
		status: "skip",
		names: [
			"should present a diff warning to the user when there are differences between the local config (json/jsonc) and the dash config",
			"should not present a diff warning to the user when there are differences between the local config (json/jsonc) and the dash config in dry-run mode",
			"should present a diff warning to the user when there are differences between the local config (toml) and the dash config",
			"in non-intractive (and non-strict) mode, should present a diff when there are differences between the local config and the dash config, and proceed with the deployment",
		],
	},
	{
		file: "deploy/config-remote.test.ts",
		ancestors: [
			"deploy",
			"config remote differences",
			"with strict mode enabled",
		],
		status: "skip",
		names: [
			"should error if there are remote config difference in non-interactive mode",
			"should error when worker was last deployed from api",
		],
	},
	{
		file: "deploy/config-remote.test.ts",
		ancestors: ["deploy", "config remote differences"],
		status: "todo",
		names: [
			"should warn the user when the deployment would (likely unintentionally) override remote secrets",
			"should handle the remote secrets fetching check for new workers",
			"should not fetch remote secrets in dry-run mode",
			"should abort the deployment when it would (likely unintentionally) override remote secrets in non-interactive strict mode",
		],
	},
	{
		file: "deploy/legacy-assets.test.ts",
		ancestors: ["deploy", "(legacy) asset upload"],
		status: "skip",
		names: [
			"should upload all the files in the directory specified by `config.site.bucket`",
			"should not contain backslash for assets with nested directories",
			"when using a service-worker type, it should add an asset manifest as a text_blob, and bind to a namespace",
			"when using a module worker type, it should add an asset manifest module, and bind to a namespace",
			"should make environment specific kv namespace for assets, even for wrangler environments",
			"should only upload files that are not already in the KV namespace",
			"should only upload files that match the `site-include` arg",
			"should not upload files that match the `site-exclude` arg",
			"should only upload files that match the `site.include` config",
			"should not upload files that match the `site.exclude` config",
			"should use `site-include` arg over `site.include` config",
			"should use `site-exclude` arg over `site.exclude` config",
			"should walk directories except node_modules",
			"should skip hidden files and directories except `.well-known`",
			"should error if the asset is over 25Mb",
			"should batch assets in groups <100 mb",
			"should error if the asset key is over 512 characters",
			"should delete uploaded assets that aren't included anymore",
			"should generate an asset manifest with keys relative to site.bucket",
			"should use the relative path from current working directory to Worker directory when using `--site`",
			"should abort other bucket uploads if one bucket upload fails",
		],
	},
	{
		file: "deploy/legacy-assets.test.ts",
		ancestors: [
			"deploy",
			"(legacy) asset upload",
			"should truncate diff with over 100 assets unless debug log level set",
		],
		status: "skip",
		names: ["default log level", "debug log level"],
	},
	{
		file: "dev/remote-bindings-errors.test.ts",
		ancestors: ["errors during dev with remote bindings"],
		status: "skip",
		names: [
			"explains how to create a draft Flagship app",
			"errors triggered when creating the remote proxy session are surfaced",
			"errors triggered when establishing the remote proxy session (after it has been created) are surfaced",
		],
	},
	{
		file: "guess-worker-format.test.ts",
		ancestors: ["guess worker format"],
		status: "skip",
		names: [
			'should detect a "modules" worker',
			'should detect a "service-worker" worker',
			'should detect a "service-worker" worker using `typeof module`',
			'should detect a "service-worker" worker using imports',
			"should not error if a .js entry point has jsx",
			"logs a warning when a worker has exports, but not a default one",
			"should list exports",
			"should detect a modules worker that uses source phase imports",
		],
	},
	{
		file: "middleware.test.ts",
		ancestors: [
			"middleware",
			"workers change behaviour with middleware with wrangler dev",
			"module workers",
		],
		status: "skip",
		names: [
			"should register a middleware and intercept",
			"should be able to access scheduled workers from middleware",
			"should trigger an error in a scheduled work from middleware",
		],
	},
	{
		file: "middleware.test.ts",
		ancestors: [
			"middleware",
			"workers change behaviour with middleware with wrangler dev",
			"service workers",
		],
		status: "skip",
		names: [
			"should register a middleware and intercept using addMiddleware",
			"should register a middleware and intercept using addMiddlewareInternal",
			"should be able to access scheduled workers from middleware",
			"should trigger an error in a scheduled work from middleware",
		],
	},
	{
		file: "middleware.test.ts",
		ancestors: [
			"middleware",
			"unchanged functionality when wrapping with middleware",
			"module workers",
		],
		status: "skip",
		names: [
			"should return Hello World with no middleware export",
			"should return hello world with empty middleware array",
			"should return hello world passing through middleware",
			"should return hello world with multiple middleware in array",
			"should leave response headers unchanged with middleware",
			"waitUntil should not block responses",
		],
	},
	{
		file: "middleware.test.ts",
		ancestors: [
			"middleware",
			"unchanged functionality when wrapping with middleware",
			"service workers",
		],
		status: "skip",
		names: [
			"should return Hello World with no middleware export",
			"should return hello world with empty middleware array",
			"should return hello world passing through middleware",
			"should return hello world with addMiddleware function called multiple times",
			"should return hello world with addMiddleware function called with array of middleware",
			"should return hello world with addMiddlewareInternal function called multiple times",
			"should return hello world with addMiddlewareInternal function called with array of middleware",
			"should return hello world with both addMiddleware and addMiddlewareInternal called",
			"should leave response headers unchanged with middleware",
			"should allow multiple addEventListeners for fetch",
			"waitUntil should not block responses",
		],
	},
	{
		file: "middleware.test.ts",
		ancestors: ["middleware", "multiple middleware"],
		status: "skip",
		names: [
			"should build multiple middleware as expected",
			"should respond correctly with D1 databases, scheduled testing, and formatted dev errors",
		],
	},
	{
		file: "pages/pages-deployment-tail.test.ts",
		ancestors: ["pages deployment tail", "API interaction"],
		status: "todo",
		names: [
			"should throw an error if deployment isn't provided",
			"creates and then delete tails by deployment ID",
			"only uses deployments with status=success and name=deploy",
			"creates and then deletes tails by deployment URL",
			"errors when passing in a deployment without a project",
			"creates and then delete tails by project name",
			"errors when the websocket closes unexpectedly",
			"passes default environment to deployments list",
			"passes production environment to deployments list",
			"passes preview environment to deployments list",
		],
	},
	{
		file: "pages/pages-deployment-tail.test.ts",
		ancestors: ["pages deployment tail", "API interaction"],
		status: "skip",
		names: ["activates debug mode when the cli arg is passed in"],
	},
	{
		file: "pages/pages-deployment-tail.test.ts",
		ancestors: ["pages deployment tail", "filtering"],
		status: "todo",
		names: [
			"should throw for bad sampling rate filters ranges",
			"should send sampling rate filter",
			"sends single status filters",
			"sends multiple status filters",
			"sends single HTTP method filters",
			"sends multiple HTTP method filters",
			"sends header filters without a query",
			"sends header filters with a query",
			"sends single IP filters",
			"sends multiple IP filters",
			"sends search filters",
			"sends everything but the kitchen sink",
		],
	},
	{
		file: "pages/pages-deployment-tail.test.ts",
		ancestors: ["pages deployment tail", "printing"],
		status: "skip",
		names: [
			"logs request messages in JSON format",
			"logs scheduled messages in JSON format",
			"logs alarm messages in json format",
			"logs email messages in json format",
			"logs queue messages in json format",
			"logs request messages in pretty format",
			"logs scheduled messages in pretty format",
			"logs alarm messages in pretty format",
			"logs email messages in pretty format",
			"logs queue messages in pretty format",
			"defaults to logging in pretty format when the output is a TTY",
			"defaults to logging in json format when the output is not a TTY",
			"logs console messages and exceptions",
		],
	},
	{
		file: "pages/pages-deployment-tail.test.ts",
		ancestors: ["pages deployment tail", "printing"],
		status: "todo",
		names: ["should not crash when the tail message has a void event"],
	},
	{
		file: "paths.test.ts",
		ancestors: ["paths", "getBasePath()"],
		status: "skip",
		names: [
			"should return the path to the wrangler package",
			"should use the __RELATIVE_PACKAGE_PATH__ as defined on the global context to compute the base path",
		],
	},
	{
		file: "paths.test.ts",
		ancestors: ["readableRelative"],
		status: "skip",
		names: [
			"should leave paths to files in the current directory as-is",
			"should leave files in the parent directory as-is",
			"should add ./ to nested paths",
		],
	},
	{
		file: "r2/local-uploads.test.ts",
		ancestors: ["r2 bucket local-uploads", "enable"],
		status: "todo",
		names: ["should error if bucket name is not provided"],
	},
	{
		file: "r2/local-uploads.test.ts",
		ancestors: ["r2 bucket local-uploads", "disable"],
		status: "todo",
		names: ["should error if bucket name is not provided"],
	},
	{
		file: "update-config-file.test.ts",
		ancestors: ["createdResourceConfig()"],
		status: "skip",
		names: [
			"non interactive: no prompts and no file update",
			"interactive: no file update after answering no",
			"interactive: file update after answering yes",
			"interactive: replaces an existing binding with the same name",
			"non interactive: replaces an existing binding with the same name",
			"interactive: file update in env after answering yes",
			"interactive: file update after answering yes-but",
			"interactive: no prompts & no file update for toml",
			"interactive: no prompts & no file update for no config file",
			"logs correct binding type",
		],
	},
	{
		file: "update-config-file.test.ts",
		ancestors: ["createdResourceConfig()", "defaults"],
		status: "skip",
		names: ["no prompts if all defaults provided"],
	},
	{
		file: "utils/retry.test.ts",
		ancestors: ["retryOnAPIFailure"],
		status: "skip",
		names: [
			"should retry 5xx errors and succeed if the 3rd try succeeds",
			"should throw 5xx error after all retries fail",
			"should retry 429 errors and succeed if the 3rd try succeeds",
			"should wait for the duration in retryAfterMs instead of the computed backoff",
			"should honour Retry-After on 5xx errors too, instead of the computed backoff",
			"should fail fast without retrying when Retry-After exceeds the cap",
			"should fail fast on a 5xx whose Retry-After exceeds the cap, rather than exhausting retries",
			"should log a message when waiting on a Retry-After header",
			"should not retry non-5xx errors",
			"should retry TypeError",
			"should not retry other errors",
			"should cancel retry backoff when abort signal fires",
			"should propagate abort error from action without retrying",
			"should retry TimeoutError from AbortSignal.timeout()",
			"should retry custom APIError implementation with non-5xx error",
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
