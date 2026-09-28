// Generated from cloudflare/workers-sdk@93d72a577. Do not rename cases.
import { describe, it } from "vitest";

const groups = [
	{
		file: "api/startDevWorker/LocalRuntimeController.test.ts",
		ancestors: ["LocalRuntimeController", "getUserWorkerInnerUrlOverrides"],
		status: "skip",
		names: [
			"parses host and port when origin hostname includes a port",
			"clears the local dev port when origin hostname does not include one",
		],
	},
	{
		file: "api/startDevWorker/LocalRuntimeController.test.ts",
		ancestors: ["LocalRuntimeController", "Core"],
		status: "skip",
		names: [
			"dispatches a typed runtimeError for an uncaught Worker exception",
			"should start Miniflare with module worker",
			"should start Miniflare with service worker",
			"should update the running Miniflare instance",
			"should skip stale bundles and only reload once for rapid updates",
			"should start Miniflare with configured compatibility settings",
			"should start inspector on random port and allow debugging",
		],
	},
	{
		file: "api/startDevWorker/LocalRuntimeController.test.ts",
		ancestors: ["LocalRuntimeController", "Bindings"],
		status: "skip",
		names: [
			"should expose basic bindings",
			"should expose WebAssembly module bindings in service workers",
			"should persist cached data",
			"should not persist data when persist is false",
			"should expose KV namespace bindings",
			"should support Secrets Store bindings",
			"should support Hello World bindings",
			"should support Workers Sites bindings",
			"should expose R2 bucket bindings",
			"should expose D1 database bindings",
			"should expose queue producer bindings and consume queue messages",
			"should expose hyperdrive bindings - default",
			"should expose hyperdrive bindings - sslmode 'prefer'",
			"should expose hyperdrive bindings - sslmode 'require' fails",
			"should support Pipeline bindings",
			"should support Images bindings",
			"should support Media bindings",
			"supports Workflow bindings",
			"exposes send email bindings",
			"exposes browser bindings",
			"exposes Workers AI bindings",
			"exposes Analytics Engine bindings",
			"exposes dispatch namespace bindings",
			"exposes mTLS bindings",
		],
	},
	{
		file: "api/startDevWorker/LocalRuntimeController.test.ts",
		ancestors: ["MultiworkerRuntimeController"],
		status: "skip",
		names: ["dispatches a typed runtimeError for an uncaught Worker exception"],
	},
	{
		file: "build-output.test.ts",
		ancestors: ["wrangler build --experimental-cf-build-output"],
		status: "skip",
		names: [
			"emits the Build Output Specification tree for a Worker",
			"uses the .js extension for the manifest key even when the entrypoint is .ts",
			"includes modules matched by custom `rules` and types them in the manifest",
			"preserves filenames when `preserveFileNames: true`",
			"copies the assets directory",
			"emits an assets-only Worker (no bundle, no manifest)",
			"writes source maps when `uploadSourceMaps` is enabled",
			"errors when --experimental-cf-build-output is used without --experimental-new-config",
			"errors when a Worker has neither bundle nor assets",
		],
	},
	{
		file: "build-output.test.ts",
		ancestors: [
			"wrangler build --experimental-cf-build-output",
			"top-level settings config.json",
		],
		status: "skip",
		names: [
			"is emitted even when there is no settings export",
			"records the mode from --env",
			"records the mode from CLOUDFLARE_ENV",
			"omits the mode when neither --env nor CLOUDFLARE_ENV is set",
			"records the mode alongside the settings export",
		],
	},
	{
		file: "cloudchamber/create.test.ts",
		ancestors: ["cloudchamber create"],
		status: "todo",
		names: [
			"should help",
			"should fail with a nice message when parameters are missing",
			"should fail with a nice message when image is invalid",
			"should fail with a nice message when parameters are mistyped",
			"should fail with a nice message when instance type is invalid",
			"should fail with a nice message when instance type is set with vcpu",
			"should create deployment (detects no interactivity)",
			"should create deployment with instance type (detects no interactivity)",
			"should create deployment indicating ssh keys (detects no interactivity)",
			"can't create deployment due to lack of fields (json)",
		],
	},
	{
		file: "cloudchamber/create.test.ts",
		ancestors: ["cloudchamber create"],
		status: "skip",
		names: [
			"properly reads wrangler config",
			"properly reads wrangler config for instance type",
		],
	},
	{
		file: "config-validation-pages.test.ts",
		ancestors: ["validatePagesConfig()", "`main` field validation"],
		status: "skip",
		names: [
			"should error if configuration contains both `pages_build_output_dir` and `main` config fields",
		],
	},
	{
		file: "config-validation-pages.test.ts",
		ancestors: ["validatePagesConfig()", "`name` field validation"],
		status: "skip",
		names: ['should error if "name" field is not specififed at the top-level'],
	},
	{
		file: "config-validation-pages.test.ts",
		ancestors: ["validatePagesConfig()", "named environments validation"],
		status: "skip",
		names: [
			"should pass if no named environments are defined",
			"should pass for environments named 'preview' and/or 'production'",
			"should error for any other named environments",
		],
	},
	{
		file: "config-validation-pages.test.ts",
		ancestors: ["validatePagesConfig()", "unsupported fields validation"],
		status: "skip",
		names: [
			"should pass if configuration contains only Pages-supported configuration fields",
			"should fail if configuration contains any fields that are not supported by Pages projects",
		],
	},
	{
		file: "config-validation-pages.test.ts",
		ancestors: ["validatePagesConfig()", "DO bindings validation"],
		status: "skip",
		names: [
			"should pass if all Durable Objects bindings specify 'script_name'",
			"should fail if any of the Durable Object bindings does not specify 'script_name'",
		],
	},
	{
		file: "custom-build.test.ts",
		ancestors: ["Custom Builds"],
		status: "skip",
		names: [
			"runCustomBuild throws UserError when a command fails",
			"runCommand aborts the custom build command",
			"runCommand aborts child processes spawned by shell commands",
		],
	},
	{
		file: "custom-build.test.ts",
		ancestors: ["Custom Builds", "WRANGLER_COMMAND environment variable"],
		status: "skip",
		names: [
			"should set WRANGLER_COMMAND=dev when wranglerCommand is dev",
			"should set WRANGLER_COMMAND=deploy when wranglerCommand is deploy",
			"should set WRANGLER_COMMAND for versions upload",
			"should set WRANGLER_COMMAND=types when wranglerCommand is types",
			"should not set WRANGLER_COMMAND when wranglerCommand is undefined",
		],
	},
	{
		file: "d1/utils.test.ts",
		ancestors: ["getDatabaseInfoFromConfig"],
		status: "skip",
		names: [
			"should handle no database",
			"should handle no matching database",
			"should handle matching database",
			"should handle matching a database with a custom migrations folder",
			"should handle matching a database with custom migrations table",
			"should handle matching a database when there are multiple databases",
		],
	},
	{
		file: "d1/utils.test.ts",
		ancestors: ["getDatabaseByNameOrBinding"],
		status: "skip",
		names: [
			"should handle no database",
			"should resolve a database by name via the D1 API",
			"should resolve an auto-provisioned binding (no database_id) via the D1 API",
			"resolves a binding-only config via the auto-provisioned name (worker name + binding)",
			"does not silently bind to an unrelated DB with the same name as the binding",
			"refuses to guess when binding has no database_name/id and worker has no name",
			"propagates non-404 API errors instead of masking them as not-found",
		],
	},
	{
		file: "deploy/email-routing.test.ts",
		ancestors: ["deploy --dry-run (Email Routing addresses)"],
		status: "todo",
		names: [
			"accepts valid addresses on dry-run and exits without uploading",
			"fails validation for malformed addresses before uploading",
		],
	},
	{
		file: "deploy/routes.test.ts",
		ancestors: ["deploy", "routes"],
		status: "todo",
		names: [
			"should deploy the worker to a route",
			"should deploy with an empty string route",
			"should deploy to a route with a pattern/{zone_id|zone_name} combo",
			"should deploy to a route with a SaaS domain",
			"should deploy to a route with a SaaS subdomain",
			"should fallback to the Wrangler v1 zone-based API if the bulk-routes API fails",
			"should error if it's a workers.dev route",
		],
	},
	{
		file: "deploy/routes.test.ts",
		ancestors: ["deploy", "routes"],
		status: "skip",
		names: ["should deploy to legacy environment specific routes"],
	},
	{
		file: "deploy/routes.test.ts",
		ancestors: ["deploy", "routes", "custom domains"],
		status: "todo",
		names: [
			"should deploy routes marked with 'custom_domain' as separate custom domains",
			"should pass enabled and previews_enabled to the custom domains API",
			"should confirm override if custom domain deploy would override an existing domain",
			"should confirm override if custom domain deploy contains a conflicting DNS record",
			"should confirm for conflicting custom domains and then again for conflicting dns",
			"should throw if an invalid custom domain is requested",
			"should not continue with publishing an override if user does not confirm",
		],
	},
	{
		file: "deploy/routes.test.ts",
		ancestors: ["deploy", "routes", "custom domains"],
		status: "skip",
		names: [
			"should deploy domains passed via --domain flag as custom domains",
			"should deploy multiple domains passed via --domain flags",
			"should deploy --domain flags alongside routes (from config when no CLI routes)",
			"should validate domain flags and reject invalid domains with wildcards",
			"should validate domain flags and reject invalid domains with paths",
			"should handle both --route and --domain flags together",
		],
	},
	{
		file: "deploy/routes.test.ts",
		ancestors: ["deploy", "routes", "deploy asset routes"],
		status: "todo",
		names: [
			"shouldn't error on routes with paths if there are no assets",
			"should warn on mounted paths",
			"does not mention 404s hit a Worker if it's assets only",
			"does mention hitting the Worker on 404 if there is one",
			"should not warn on mounted paths if run_worker_first = false",
		],
	},
	{
		file: "deploy/routes.test.ts",
		ancestors: ["deploy", "triggers"],
		status: "todo",
		names: [
			"should deploy the worker with a scheduled trigger",
			"should deploy the worker with an empty array of scheduled triggers",
			"should deploy the worker without updating the scheduled triggers",
			"should deploy the worker without updating the scheduled triggers",
			"should deploy the worker without updating the scheduled triggers",
			"should aggregate errors from multiple failing triggers and still log successful targets",
		],
	},
	{
		file: "errors.test.ts",
		ancestors: ["errors", "UserError"],
		status: "skip",
		names: [
			"takes a custom telemetry message",
			"can set telemetryMessage to equal the main message",
		],
	},
	{
		file: "errors.test.ts",
		ancestors: ["errors", "DeprecationError"],
		status: "skip",
		names: [
			"takes a custom telemetry message",
			"can set telemetryMessage to equal the main message",
		],
	},
	{
		file: "errors.test.ts",
		ancestors: ["errors", "FatalError"],
		status: "skip",
		names: [
			"takes a custom telemetry message",
			"can set telemetryMessage to equal the main message",
		],
	},
	{
		file: "errors.test.ts",
		ancestors: ["errors", "CommandLineArgsError"],
		status: "skip",
		names: [
			"takes a custom telemetry message",
			"can set telemetryMessage to equal the main message",
		],
	},
	{
		file: "errors.test.ts",
		ancestors: ["errors", "JsonFriendlyFatalError"],
		status: "skip",
		names: [
			"takes a custom telemetry message",
			"can set telemetryMessage to equal the main message",
		],
	},
	{
		file: "errors.test.ts",
		ancestors: ["errors", "MissingConfigError"],
		status: "skip",
		names: ["just sets the telemetry message as the main message"],
	},
	{
		file: "errors.test.ts",
		ancestors: ["errors", "ParseError"],
		status: "skip",
		names: [
			"takes a custom telemetry message",
			"can set telemetryMessage to equal the main message",
		],
	},
	{
		file: "errors.test.ts",
		ancestors: ["errors", "APIError"],
		status: "skip",
		names: [
			"takes a custom telemetry message",
			"can set telemetryMessage to equal the main message",
		],
	},
	{
		file: "is-local.test.ts",
		ancestors: [],
		status: "todo",
		names: [
			'isLocal({"remote":true}, true) -> false',
			'isLocal({"remote":true}, false) -> false',
			'isLocal({"remote":false}, true) -> true',
			'isLocal({"remote":false}, false) -> true',
			'isLocal({"local":true}, true) -> true',
			'isLocal({"local":true}, false) -> true',
			'isLocal({"local":false}, true) -> false',
			'isLocal({"local":false}, false) -> false',
			"isLocal({}, true) -> true",
			"isLocal({}, false) -> false",
		],
	},
	{
		file: "pages/build-functions-errors.test.ts",
		ancestors: ["Pages Functions build error adapter"],
		status: "skip",
		names: [
			"preserves unexpected route discovery errors",
			"preserves unexpected routes module errors",
		],
	},
	{
		file: "pages/project-delete.test.ts",
		ancestors: ["pages project delete"],
		status: "todo",
		names: [
			"should delete a project with the given name",
			"should error if no project name is specified",
			"should not delete a project if confirmation refused",
		],
	},
	{
		file: "pages/project-delete.test.ts",
		ancestors: ["pages project delete"],
		status: "skip",
		names: [
			"should override cached accountId with CLOUDFLARE_ACCOUNT_ID environmental variable if provided",
		],
	},
	{
		file: "preview.settings.test.ts",
		ancestors: ["wrangler preview", "preview settings"],
		status: "skip",
		names: ["should display cache setting in pretty format"],
	},
	{
		file: "preview.settings.test.ts",
		ancestors: ["wrangler preview", "preview settings update"],
		status: "skip",
		names: [
			"should prefer previews cache over top-level cache",
			"should fall back to top-level cache when previews.cache is absent",
		],
	},
	{
		file: "sentry.test.ts",
		ancestors: ["sentry", "non interactive"],
		status: "skip",
		names: [
			"should not hit sentry in normal usage",
			"should not hit sentry after error",
		],
	},
	{
		file: "sentry.test.ts",
		ancestors: ["sentry", "interactive"],
		status: "skip",
		names: [
			"should not hit sentry in normal usage",
			"should not hit sentry with user error",
			"should not hit sentry (or even ask) after reportable error if WRANGLER_SEND_ERROR_REPORTS is explicitly false",
			"should hit sentry after reportable error (without confirmation) if WRANGLER_SEND_ERROR_REPORTS is explicitly true",
		],
	},
	{
		file: "utils/create-batches.test.ts",
		ancestors: ["createBatches"],
		status: "skip",
		names: [
			"a,b,c,d,e in batches of 2",
			"a,b,c,d,e,f,g,h in batches of 3",
			"a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z in batches of 6",
		],
	},
	{
		file: "versions/versions.deploy.test.ts",
		ancestors: [
			"units",
			"assignAndDistributePercentages distributes remaining share of 100%",
		],
		status: "todo",
		names: [
			" 'from 1 specified value across 1 unspe…'",
			" 'from 1 specified value across 2 unspe…'",
			" 'from 2 specified values across 1 unsp…'",
			" 'from 2 specified values across 2 unsp…'",
			" 'limited to specified versionIds'",
			" 'zero when no share remains'",
			" 'unchanged when fully specified (addin…'",
			" 'unchanged when fully specified (addin…'",
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
