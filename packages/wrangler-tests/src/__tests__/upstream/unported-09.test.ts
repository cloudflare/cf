// Generated from cloudflare/workers-sdk@93d72a577. Do not rename cases.
import { describe, it } from "vitest";

const groups = [
	{
		file: "api/startDevWorker/DevEnv.test.ts",
		ancestors: ["DevEnv", "handleErrorEvent"],
		status: "skip",
		names: [
			"should format esbuild BuildFailure errors nicely for BundlerController",
			"should format esbuild BuildFailure from cause for BundlerController",
			"should log non-esbuild BundlerController errors with just the message",
		],
	},
	{
		file: "browser-run.test.ts",
		ancestors: ["wrangler browser", "list"],
		status: "todo",
		names: ["should output JSON when --json flag is used"],
	},
	{
		file: "browser-run.test.ts",
		ancestors: ["wrangler browser", "view"],
		status: "todo",
		names: ["should prefer page targets over other types"],
	},
	{
		file: "browser-run.test.ts",
		ancestors: ["wrangler browser", "create"],
		status: "todo",
		names: [
			"should output JSON when --json flag is used",
			"should prefer page targets over other types",
		],
	},
	{
		file: "browser-run.test.ts",
		ancestors: ["wrangler browser", "close"],
		status: "todo",
		names: ["should output JSON when --json flag is used"],
	},
	{
		file: "cloudchamber/common.test.ts",
		ancestors: ["parseImageName"],
		status: "skip",
		names: ["works"],
	},
	{
		file: "config-schema.test.ts",
		ancestors: ["config schema"],
		status: "skip",
		names: ["keeps allowTrailingCommas off the root $ref"],
	},
	{
		file: "create-worker-upload-form/mime-types.test.ts",
		ancestors: ["moduleTypeMimeType"],
		status: "skip",
		names: [
			"should map esm to application/javascript+module",
			"should map commonjs to application/javascript",
			"should map compiled-wasm to application/wasm",
			"should map buffer to application/octet-stream",
			"should map text to text/plain",
			"should map python to text/x-python",
			"should map python-requirement to text/x-python-requirement",
		],
	},
	{
		file: "create-worker-upload-form/mime-types.test.ts",
		ancestors: ["fromMimeType"],
		status: "skip",
		names: [
			"should reverse-map application/javascript+module to esm",
			"should reverse-map application/javascript to commonjs",
			"should reverse-map application/wasm to compiled-wasm",
			"should reverse-map application/octet-stream to buffer",
			"should throw for unsupported mime types",
		],
	},
	{
		file: "d1/trimmer.test.ts",
		ancestors: ["mayContainTransaction()"],
		status: "skip",
		names: [
			"should return false if there for regular queries",
			"should return true if there is a transaction",
		],
	},
	{
		file: "d1/trimmer.test.ts",
		ancestors: ["trimSqlQuery()"],
		status: "skip",
		names: [
			"should return original SQL if there are no real statements",
			"should not trim single statements",
			"should trim a regular old sqlite dump",
			"should throw when provided multiple transactions",
			"should handle strings",
			"should handle inline comments",
			"should handle block comments",
			"should split multiple statements",
			"should handle whitespace between statements",
			"should handle $...$ style string markers",
			"should handle compound statements",
		],
	},
	{
		file: "deploy/durable-objects.test.ts",
		ancestors: ["deploy", "durable object migrations"],
		status: "todo",
		names: [
			"should warn when you try to deploy durable objects without a lifecycle declared",
			"does not warn if all the durable object bindings are to external classes",
			"should deploy all migrations on first deploy",
			"should upload migrations past a previously uploaded tag",
			"should not send migrations if they've all already been sent",
		],
	},
	{
		file: "deploy/durable-objects.test.ts",
		ancestors: ["deploy", "durable object migrations", "dispatch namespaces"],
		status: "todo",
		names: [
			"should deploy all migrations on first deploy",
			"should use a script's current migration tag when publishing migrations",
		],
	},
	{
		file: "deploy/durable-objects.test.ts",
		ancestors: ["deploy", "durable object exports (declarative)"],
		status: "todo",
		names: [
			"sends the `exports` payload (and omits `migrations`)",
			"renders the success-side reconciliation envelope",
			"renders the error-side reconciliation envelope with per-class detail",
		],
	},
	{
		file: "deploy/durable-objects.test.ts",
		ancestors: ["deploy", "tail consumers"],
		status: "todo",
		names: ["should allow specifying workers as tail consumers"],
	},
	{
		file: "deploy/durable-objects.test.ts",
		ancestors: ["deploy", "user limits"],
		status: "todo",
		names: [
			"should allow specifying a cpu millisecond limit",
			"should allow specifying a subrequests limit",
		],
	},
	{
		file: "deploy/durable-objects.test.ts",
		ancestors: ["deploy", "ai"],
		status: "todo",
		names: ["should upload ai bindings"],
	},
	{
		file: "deploy/durable-objects.test.ts",
		ancestors: ["deploy", "images"],
		status: "todo",
		names: ["should upload images bindings"],
	},
	{
		file: "deploy/durable-objects.test.ts",
		ancestors: ["deploy", "stream"],
		status: "todo",
		names: ["should upload stream bindings"],
	},
	{
		file: "deploy/durable-objects.test.ts",
		ancestors: ["deploy", "python"],
		status: "skip",
		names: [
			"should upload python module defined in wrangler.toml",
			"should print vendor modules correctly in table",
			"should upload python module specified in CLI args",
		],
	},
	{
		file: "deploy/durable-objects.test.ts",
		ancestors: ["deploy", "hyperdrive"],
		status: "todo",
		names: ["should upload hyperdrive bindings"],
	},
	{
		file: "deploy/durable-objects.test.ts",
		ancestors: ["deploy", "vpc_services"],
		status: "todo",
		names: [
			"should upload VPC services bindings",
			"should upload multiple VPC services bindings",
		],
	},
	{
		file: "deploy/durable-objects.test.ts",
		ancestors: ["deploy", "vpc_networks"],
		status: "todo",
		names: [
			"should upload VPC network bindings",
			"should upload multiple VPC network bindings",
			"should upload VPC network bindings with network_id",
		],
	},
	{
		file: "deploy/durable-objects.test.ts",
		ancestors: ["deploy", "mtls_certificates"],
		status: "todo",
		names: ["should upload mtls_certificate bindings"],
	},
	{
		file: "deploy/durable-objects.test.ts",
		ancestors: ["deploy", "pipelines"],
		status: "todo",
		names: ["should upload pipelines bindings"],
	},
	{
		file: "deploy/durable-objects.test.ts",
		ancestors: ["deploy", "secrets_store_secrets"],
		status: "todo",
		names: ["should upload secret store bindings"],
	},
	{
		file: "deploy/queues.test.ts",
		ancestors: ["deploy", "queues"],
		status: "todo",
		names: [
			"should upload producer bindings",
			"should update queue producers on deploy",
			"should post worker queue consumers on deploy",
			"should post worker queue consumers on deploy, using command line script name arg",
			"should update worker queue consumers on deploy",
			"should update worker (service) queue consumers with default environment on deploy",
			"should reject http_pull consumer type in config",
			"should support queue consumer concurrency with a max concurrency specified",
			"should support queue consumer concurrency with a null max concurrency",
			"should support queue consumer with max_batch_timeout of 0",
			"consumer should error when a queue doesn't exist",
			"producer should error when a queue doesn't exist",
		],
	},
	{
		file: "dev/start-dev.test.ts",
		ancestors: ["startDev"],
		status: "skip",
		names: [
			"unregisters the latest hotkey registration after auth re-registers hotkeys",
			"prints the Local Explorer API hint when the caller asks for it",
			"does not print the Local Explorer API hint when the caller has not opted in",
		],
	},
	{
		file: "init.test.ts",
		ancestors: ["init", "`wrangler init` now delegates to c3 by default"],
		status: "skip",
		names: [
			"shows that it delegates to C3",
			"if `-y` is used, delegate to c3 with --wrangler-defaults",
			"if telemetry is disabled in wrangler, then disable for c3 too",
		],
	},
	{
		file: "init.test.ts",
		ancestors: [
			"init",
			"`wrangler init` now delegates to c3 by default",
			"with yarn package manager",
		],
		status: "skip",
		names: [
			"uses C3 command without version specifier for yarn",
			"uses C3 command without version specifier when using --from-dash with yarn",
		],
	},
	{
		file: "init.test.ts",
		ancestors: [
			"init",
			"`wrangler init` now delegates to c3 by default",
			"with custom C3 command",
		],
		status: "skip",
		names: [
			"shows that it delegates to C3",
			"if `-y` is used, delegate to c3 with --wrangler-defaults",
		],
	},
	{
		file: "init.test.ts",
		ancestors: ["init", "--from-dash --no-delegate-c3"],
		status: "skip",
		names: [
			"delegates to C3 --type pre-existing",
			"should download routes + custom domains + workers dev",
			"should fail on init --from-dash on non-existent worker name",
			"should download source script from dashboard w/ out positional <name>",
			"should download source script from dashboard as plain JavaScript",
			"should include user limits",
			"should ignore usage_model = bundled",
			"should ignore usage_model = unbound",
			"should ignore usage_model = standard",
			"should use fallback compatibility date if none is upstream",
			"should throw an error to retry if a request fails",
			"should not include migrations in config file when none are necessary",
			"should not continue if no worker name is provided",
			"should download multi-module source scripts from dashboard",
		],
	},
	{
		file: "package-manager.test.ts",
		ancestors: ["getPackageManager()", "no supported package manager"],
		status: "todo",
		names: ["should throw an error"],
	},
	{
		file: "package-manager.test.ts",
		ancestors: ["getPackageManager()", "using npm"],
		status: "todo",
		names: ["should return the npm package manager"],
	},
	{
		file: "package-manager.test.ts",
		ancestors: ["getPackageManager()", "using yarn"],
		status: "todo",
		names: ["should return the yarn package manager"],
	},
	{
		file: "package-manager.test.ts",
		ancestors: ["getPackageManager()", "using pnpm"],
		status: "todo",
		names: ["should return the pnpm package manager"],
	},
	{
		file: "package-manager.test.ts",
		ancestors: ["getPackageManager()", "using npm; yarn"],
		status: "todo",
		names: ["should return the npm package manager"],
	},
	{
		file: "package-manager.test.ts",
		ancestors: ["getPackageManager()", "using npm; yarn; pnpm"],
		status: "todo",
		names: ["should return the npm package manager"],
	},
	{
		file: "package-manager.test.ts",
		ancestors: ["getPackageManager()", "using npm; yarn; pnpm; bun"],
		status: "todo",
		names: ["should return the npm package manager"],
	},
	{
		file: "package-manager.test.ts",
		ancestors: ["getPackageManager()", "using bun"],
		status: "todo",
		names: ["should return the bun package manager"],
	},
	{
		file: "pages/project-create.test.ts",
		ancestors: ["pages project create"],
		status: "todo",
		names: [
			"should create a project with a production branch",
			"should create a project with compatibility flags",
			"should create a project with a compatibility date",
		],
	},
	{
		file: "pages/project-create.test.ts",
		ancestors: ["pages project create"],
		status: "skip",
		names: [
			"should override cached accountId with CLOUDFLARE_ACCOUNT_ID environmental variable if provided",
		],
	},
	{
		file: "preview.secret.test.ts",
		ancestors: ["wrangler preview", "preview secret", "put"],
		status: "todo",
		names: [
			"creates a new Preview deployment with the secret",
			"sends --message and --tag as deployment annotations",
			"uses the default annotation message when none is provided",
			"fails clearly when the Preview has no deployments",
			"fails clearly when the Preview is not found",
			"fails before making API calls when env-specific previews config is invalid",
		],
	},
	{
		file: "preview.secret.test.ts",
		ancestors: ["wrangler preview", "preview secret", "put"],
		status: "skip",
		names: [
			"notes when the new Preview deployment has no active URLs",
			"defaults the Preview name to the current git branch",
			"fails clearly when no name is given and there is no git branch",
			"respects env-specific worker name when using --env",
		],
	},
	{
		file: "preview.secret.test.ts",
		ancestors: ["wrangler preview", "preview secret", "delete"],
		status: "todo",
		names: [
			"creates a new Preview deployment removing the secret",
			"uses the default annotation message when none is provided",
			"fails clearly when the Preview has no deployments",
			"fails clearly when the Preview is not found",
		],
	},
	{
		file: "preview.secret.test.ts",
		ancestors: ["wrangler preview", "preview secret", "delete"],
		status: "skip",
		names: [
			"notes when the new Preview deployment has no active URLs",
			"respects env-specific worker name when deleting a secret",
		],
	},
	{
		file: "preview.secret.test.ts",
		ancestors: ["wrangler preview", "preview secret", "list"],
		status: "todo",
		names: [
			"reads the latest Preview deployment",
			"fails clearly when the Preview has no deployments",
			"fails clearly when the Preview is not found",
		],
	},
	{
		file: "preview.secret.test.ts",
		ancestors: ["wrangler preview", "preview secret", "list"],
		status: "skip",
		names: [
			"lists only secrets and never leaks their values ('json, value provided')",
			"lists only secrets and never leaks their values ('pretty, value provided')",
			"defaults the Preview name to the current git branch",
			"should respect env-specific worker name when listing secrets",
		],
	},
	{
		file: "preview.secret.test.ts",
		ancestors: ["wrangler preview", "preview secret", "bulk"],
		status: "todo",
		names: [
			"creates a new Preview deployment with all secrets",
			"sends --message and --tag as deployment annotations",
			"uses the default annotation message when none is provided",
			"deletes secrets for null values, like `wrangler secret bulk`",
			"makes no API call when there is no input",
			"fails clearly when the Preview has no deployments",
			"fails clearly when the Preview is not found",
		],
	},
	{
		file: "preview.secret.test.ts",
		ancestors: ["wrangler preview", "preview secret", "bulk"],
		status: "skip",
		names: [
			"notes when the new Preview deployment has no active URLs",
			"should respect env-specific worker name when bulk uploading secrets",
		],
	},
	{
		file: "secrets-store.test.ts",
		ancestors: ["secrets-store help"],
		status: "todo",
		names: [
			"shows help text when no arguments are passed",
			"shows help when an invalid argument is passed",
		],
	},
	{
		file: "secrets-store.test.ts",
		ancestors: ["secrets-store secret commands", "secrets-store secret create"],
		status: "todo",
		names: ["errors in creating a secret when value is larger than 64 KiB"],
	},
	{
		file: "utils-memoizeGetPort.test.ts",
		ancestors: ["memoizeGetPort()"],
		status: "skip",
		names: [
			"should throw a UserError when port binding is blocked by EPERM",
			"should mention sandbox in EPERM error message",
			"should throw a UserError when port binding is blocked by EACCES",
			"should re-throw non-permission errors unchanged",
			"should not treat filesystem EPERM as a network bind error",
		],
	},
	{
		file: "vectorize/vectorize.upsert.test.ts",
		ancestors: ["dataset upsert"],
		status: "todo",
		names: [
			"should batch uploads in ndjson format for Vectorize",
			"should batch uploads for upsert in ndjson format for Vectorize",
			"should output valid JSON for insert with --json flag",
			"should output valid JSON for upsert with --json flag",
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
