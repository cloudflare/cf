// Generated from cloudflare/workers-sdk@93d72a577. Do not rename cases.
import { describe, it } from "vitest";

const groups = [
	{
		file: "ai-search.test.ts",
		ancestors: ["ai-search commands", "namespace", "create"],
		status: "todo",
		names: ["should error when name is missing"],
	},
	{
		file: "ai-search.test.ts",
		ancestors: ["ai-search commands", "namespace", "update"],
		status: "todo",
		names: ["should error when no fields are provided"],
	},
	{
		file: "ai-search.test.ts",
		ancestors: ["ai-search commands", "jobs", "list"],
		status: "todo",
		names: ["should pass pagination params"],
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
		file: "cfetch-internal.test.ts",
		ancestors: ["isWAFBlockResponse"],
		status: "todo",
		names: [
			"should detect a WAF-mitigated response",
			"should return false when cf-mitigated header is absent",
			"should return false when cf-mitigated has a different value",
		],
	},
	{
		file: "cfetch-internal.test.ts",
		ancestors: ["extractWAFBlockRayId"],
		status: "todo",
		names: [
			"should extract the Ray ID from the cf-ray header",
			"should return undefined when cf-ray header is absent",
		],
	},
	{
		file: "cfetch-internal.test.ts",
		ancestors: ["addAuthorizationHeader"],
		status: "todo",
		names: [
			"should throw a helpful error when the API token cannot be used in an Authorization header",
			"should set the Authorization header for an ASCII API token",
		],
	},
	{
		file: "cfetch-internal.test.ts",
		ancestors: ["fetchInternal WAF block detection"],
		status: "todo",
		names: [
			"should throw a helpful error when the API returns a WAF block response",
			"should include the Ray ID in the error when cf-ray header is present",
			"should still throw a WAF error without the Ray ID note when cf-ray header is absent",
			"should still throw 'malformed response' for non-WAF HTML responses",
			"should include the Ray ID in 'malformed response' error when cf-ray header is present",
			"should omit the Ray ID in 'malformed response' error when cf-ray header is absent",
		],
	},
	{
		file: "cfetch-internal.test.ts",
		ancestors: ["fetchResult 429 Retry-After handling"],
		status: "todo",
		names: [
			"should hoist a delta-seconds Retry-After header onto the thrown APIError",
			"should leave retryAfterMs undefined when no Retry-After header is present",
		],
	},
	{
		file: "cloudchamber/limits.test.ts",
		ancestors: ["ensureContainerLimits", "instance type"],
		status: "todo",
		names: [
			"should throw error if vcpu is greater than limit",
			"should throw error if memory is greater than limit",
			"should throw error if disk is greater than limit",
			"should succeed when instance type fits in limits",
		],
	},
	{
		file: "cloudchamber/limits.test.ts",
		ancestors: ["ensureContainerLimits", "custom limits"],
		status: "todo",
		names: [
			"should throw error if vcpu is greater than limit",
			"should throw error if memory is greater than limit",
			"should throw error if disk is greater than limit",
			"should succeed when configuration fits in limits",
		],
	},
	{
		file: "cloudchamber/limits.test.ts",
		ancestors: ["ensureImageFitsLimits"],
		status: "todo",
		names: [
			"should throw error if image size exceeds allowed size",
			"should not throw when disk size is within limits",
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
		file: "d1/export.test.ts",
		ancestors: ["export"],
		status: "skip",
		names: [
			"should fail when database_id absent from config and not found in API",
		],
	},
	{
		file: "deploy/check-remote-secrets-override.test.ts",
		ancestors: ["checkRemoteSecretsOverride"],
		status: "todo",
		names: [
			"should return { override: false } when there are no possible overrides",
			"should detect and provide a valid deploy error message when a variable name overrides a secret",
			"should detect and provide a valid deploy error message when multiple (2) variable names override secrets",
			"should detect and provide a valid deploy error message when multiple (3) variable names override secrets",
			"should detect and provide a valid deploy error message when a binding name overrides a secret",
			"should detect and provide a valid deploy error message when multiple binding names override secrets",
			"should detect and provide a valid deploy error message when a combination of variables and binding names override secrets",
			"should not unnecessarily fetch secrets when there are no env vars nor bindings in the config file",
		],
	},
	{
		file: "deploy/get-config-patch.test.ts",
		ancestors: ["getConfigPatch"],
		status: "skip",
		names: [
			"top level config updated",
			"env var present remotely but deleted locally",
			"updated value of env var",
			"env var renamed",
			"deleted version metadata binding",
			"deleted KV binding (only one KV)",
			"deleted second KV binding in the kv_namespaces array",
			"modified KV binding",
			"deleted second KV binding in the kv_namespaces array and modified first one",
			"deleted KV binding from the middle of the kv_namespaces array",
			"flipped observability.logs.invocation_logs off (nested field)",
			"renamed version metadata binding",
			"configs get added/set to a target environment",
		],
	},
	{
		file: "dev.test.ts",
		ancestors: ["wrangler dev", "Local Explorer agent hint"],
		status: "skip",
		names: [
			"asks startDev to print the hint for headless agent sessions",
			"does not ask startDev to print the hint for interactive agent sessions",
			"does not ask startDev to print the hint for non-agent sessions",
		],
	},
	{
		file: "dev.test.ts",
		ancestors: ["wrangler dev", "durable_objects"],
		status: "skip",
		names: [
			"should warn if there are remote Durable Objects, or a missing lifecycle for local Durable Objects",
		],
	},
	{
		file: "dev.test.ts",
		ancestors: ["wrangler dev", "durable_objects", "declarative `exports`"],
		status: "skip",
		names: [
			"starts dev when `exports` is set",
			"resolves a container referenced from a durable object export",
		],
	},
	{
		file: "dev.test.ts",
		ancestors: ["wrangler dev", "tunnel"],
		status: "skip",
		names: [
			"should pass --tunnel flag through to dev config",
			"should pass --tunnel-name with --tunnel through to dev config",
			"should allow --tunnel-name without enabling tunnel",
			"should default tunnel to undefined when not specified",
			"should error when --tunnel and --remote are both specified",
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
		file: "metrics.test.ts",
		ancestors: ["metrics", "getMetricsDispatcher()", "sendAdhocEvent()"],
		status: "skip",
		names: [
			"should send a request to the default URL",
			"should include parsed wrangler version components in events",
			"should write a debug log if the dispatcher is disabled",
			"should write a debug log if the request fails",
			"should write a warning log if no source key has been provided",
			"should include agent ID when detected",
			"should set agent to null if detection returns null id",
		],
	},
	{
		file: "metrics.test.ts",
		ancestors: [
			"metrics",
			"getMetricsDispatcher()",
			"agent skills install status fetch",
		],
		status: "skip",
		names: [
			"should not query the GitHub skills API if the dispatcher is disabled",
			"should query the GitHub skills API once if the dispatcher is enabled",
		],
	},
	{
		file: "metrics.test.ts",
		ancestors: ["metrics", "getMetricsDispatcher()", "sendCommandEvent()"],
		status: "skip",
		names: [
			"should send a started and completed event",
			"should send a started and errored event",
			"should mark isCI as true if running in CI",
			"should mark isPagesCI as true if running in Pages CI",
			"should mark isWorkersCI as true if running in Workers CI",
			"should capture Workers + Assets projects",
			"should not send arguments with wrangler login",
			"should include args provided by the user",
			"should mark as non-interactive if running in non-interactive environment",
			"should include an error message if the specific error has been allow-listed with {telemetryMessage:true}",
			"should include an error message if the specific error has been allow-listed with a custom telemetry message",
			"should include agent ID in command events when detected",
		],
	},
	{
		file: "metrics.test.ts",
		ancestors: [
			"metrics",
			"getMetricsDispatcher()",
			"sendCommandEvent()",
			"banner",
		],
		status: "skip",
		names: [
			"should print the banner if current version is different to the stored version",
			"should not print the banner if current version is the same as the stored version",
			"should print the banner if nothing is stored under bannerLastShown and then store the current version",
			"should not print the banner if telemetry permission is disabled",
			"should *not* print the banner if command is not dev/deploy/docs",
		],
	},
	{
		file: "metrics.test.ts",
		ancestors: ["metrics", "getMetricsConfig()", "enabled"],
		status: "skip",
		names: [
			"should return the WRANGLER_SEND_METRICS environment variable for enabled if it is defined",
			"should return enabled false if the DO_NOT_TRACK environment variable is set",
			"should let DO_NOT_TRACK override the WRANGLER_SEND_METRICS environment variable",
			"should ignore DO_NOT_TRACK if it is not set to an opt-out value",
			"should return the sendMetrics argument for enabled if it is defined",
			"should return enabled true if the user on this device previously agreed to send metrics",
			"should return enabled false if the user on this device previously refused to send metrics",
			"should print a message if the permission date is older than the current metrics date",
		],
	},
	{
		file: "metrics.test.ts",
		ancestors: ["metrics", "getMetricsConfig()", "deviceId"],
		status: "skip",
		names: [
			"should return a deviceId found in the config file",
			"should create and store a new deviceId if none is found in the config file",
		],
	},
	{
		file: "metrics.test.ts",
		ancestors: ["metrics", "metrics commands", "metrics status"],
		status: "skip",
		names: [
			"prints the current telemetry status based on the cached metrics config",
			"shows the wrangler config as the source when send_metrics is present",
			"shows WRANGLER_SEND_METRICS as the source if used",
			"defaults to enabled if metrics config is not set",
			"prioritises environment variable over send_metrics",
		],
	},
	{
		file: "metrics.test.ts",
		ancestors: ["metrics", "metrics commands"],
		status: "skip",
		names: [
			'disables telemetry when "wrangler metrics disable" is run',
			'doesn\'t send telemetry when running "wrangler metrics disable"',
			'does send telemetry when running "wrangler metrics enable"',
			'enables telemetry when "wrangler metrics enable" is run',
			'persists enabled but reports disabled when "wrangler metrics enable" is run with DO_NOT_TRACK',
			"doesn't overwrite c3 telemetry config",
		],
	},
	{
		file: "metrics.test.ts",
		ancestors: ["metrics", "telemetry commands", "telemetry status"],
		status: "skip",
		names: [
			"prints the current telemetry status based on the cached metrics config",
			"shows the wrangler config as the source when send_metrics is present",
			"shows WRANGLER_SEND_METRICS as the source if used",
			"defaults to enabled if metrics config is not set",
			"prioritises environment variable over send_metrics",
		],
	},
	{
		file: "metrics.test.ts",
		ancestors: ["metrics", "telemetry commands"],
		status: "skip",
		names: [
			'disables telemetry when "wrangler telemetry disable" is run',
			'doesn\'t send telemetry when running "wrangler telemetry disable"',
			'does send telemetry when running "wrangler telemetry enable"',
			'enables telemetry when "wrangler telemetry enable" is run',
			'persists enabled but reports disabled when "wrangler telemetry enable" is run with DO_NOT_TRACK',
			"doesn't overwrite c3 telemetry config",
		],
	},
	{
		file: "pages/dev.test.ts",
		ancestors: ["pages dev"],
		status: "todo",
		names: [
			"should error if neither [<directory>] nor [--<command>] command line args were specified",
			"should error if both [<directory>] and [--<command>] command line args were specified",
			"should error if the [--config] command line arg was specified",
			"should error if the [--env] command line arg was specified",
		],
	},
	{
		file: "pages/run-workers-deploy.test.ts",
		ancestors: ["runPagesToWorkersDeploy"],
		status: "skip",
		names: [
			"runs delegated deploys with the yargs defaults the handler expects",
		],
	},
	{
		file: "provision.test.ts",
		ancestors: ["resource provisioning"],
		status: "skip",
		names: [
			"should inherit KV, R2 and D1 bindings if they could be found from the settings",
			"auto-provisions Queue, Dispatch Namespace, and Flagship bindings",
			"provisions a Queue used by both a producer and consumer",
			"can select Queue, Dispatch Namespace, and Flagship resources from later pages",
			"inherits Queue, Dispatch Namespace, and Flagship bindings",
			"preserves Queue and Dispatch Namespace options when reusing deployed resources",
		],
	},
	{
		file: "provision.test.ts",
		ancestors: [
			"resource provisioning",
			"provisions KV, R2 and D1 bindings if not found in worker settings",
		],
		status: "skip",
		names: [
			"can provision KV, R2 and D1 bindings with existing resources",
			"can provision KV, R2 and D1 bindings with existing resources, and lets you search when there are too many to list",
			"can provision KV, R2 and D1 bindings with new resources",
			"can provision KV, R2 and D1 bindings with new resources w/ redirected config",
			"can inject additional bindings in redirected config that aren't written back to disk",
			"does not write an injected binding with a cross-type name collision back to redirected config",
			"can prefill d1 database name from config file if provided",
			"can inherit d1 binding when the database name is provided",
			"will not inherit d1 binding when the database name is provided but has changed",
			"can prefill r2 bucket name from config file if provided",
			"won't prompt to provision if an r2 bucket name belongs to an existing bucket",
			"won't prompt to provision if a D1 database name belongs to an existing database",
			"will provision if the jurisdiction changes",
		],
	},
	{
		file: "provision.test.ts",
		ancestors: [
			"resource provisioning",
			"provisions ai_search_namespace bindings",
		],
		status: "skip",
		names: ["should create an AI Search namespace if it does not exist"],
	},
	{
		file: "provision.test.ts",
		ancestors: ["resource provisioning", "provisions agent_memory bindings"],
		status: "skip",
		names: [
			"should inherit agent_memory binding if found in the deployed settings",
			"should connect to existing agent_memory namespace if it already exists",
			"should create agent_memory namespace if it does not exist",
		],
	},
	{
		file: "type-generation-pipeline-schema.test.ts",
		ancestors: ["streamNameToTypeName"],
		status: "skip",
		names: [
			"should convert snake_case to PascalCase with Record suffix",
			"should convert kebab-case to PascalCase with Record suffix",
			"should handle single word",
		],
	},
	{
		file: "type-generation-pipeline-schema.test.ts",
		ancestors: ["generatePipelineTypeFromSchema"],
		status: "skip",
		names: [
			"should return generic type for null schema",
			"should return generic type for schema with empty fields",
			"should return generic type for schema with empty fields even when stream name is provided",
			"should return generic type for schema with non-array fields",
			"should generate named type when stream name is provided",
			"should generate inline type when stream name is not provided",
			"should generate type for optional field",
			"should generate types for all primitive types",
			"should generate type for list field",
			"should generate type for nested struct field",
			"should generate type for complex schema with multiple field types",
			"should quote field names that are not valid identifiers",
			"should escape special characters in field names",
			"should handle list without items definition",
			"should handle struct without fields definition",
			"should handle unknown field types gracefully",
			"should limit nesting depth to prevent stack overflow",
		],
	},
	{
		file: "utils/getValidBindingName.test.ts",
		ancestors: ["getValidBindingName"],
		status: "skip",
		names: [
			"should replace dashes with underscores",
			"should replace consecutive underscores with single underscore",
			"should prepend an underscore if it starts with a number",
			"should replace whitespaces with underscores",
			"should remove all invalid character",
			"should not remove alphabetic characters, numbers, or underscores",
			"should fallback if no valid binding name is possible",
			"should fallback if output is only underscores",
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
