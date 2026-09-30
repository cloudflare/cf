// Generated from cloudflare/workers-sdk@c2bb4c815. Do not rename cases.
import { describe, it } from "vitest";

const groups = [
	{
		file: "ai-search.test.ts",
		ancestors: ["ai-search commands", "search"],
		status: "todo",
		names: [
			"should send search overrides using AI Search options",
			"should preserve zero-valued score threshold overrides",
			"should preserve false reranking overrides",
		],
	},
	{
		file: "api/startDevWorker/RemoteRuntimeController.test.ts",
		ancestors: ["RemoteRuntimeController", "stale bundle bail-out"],
		status: "skip",
		names: ["should skip stale bundles and only reload once for rapid updates"],
	},
	{
		file: "api/startDevWorker/RemoteRuntimeController.test.ts",
		ancestors: ["RemoteRuntimeController", "proactive token refresh"],
		status: "skip",
		names: [
			"should proactively refresh the token before expiry",
			"should cancel the proactive refresh timer on bundle start",
			"should cancel the proactive refresh timer on teardown",
		],
	},
	{
		file: "api/startDevWorker/RemoteRuntimeController.test.ts",
		ancestors: ["RemoteRuntimeController", "preview token refresh"],
		status: "skip",
		names: [
			"should handle missing state gracefully",
			"should call API with stored config/bundle when refreshing",
			"should emit reloadComplete event with fresh token when refreshing",
		],
	},
	{
		file: "api/startDevWorker/RemoteRuntimeController.test.ts",
		ancestors: ["RemoteRuntimeController", "authentication error handling"],
		status: "skip",
		names: [
			"should call handlePreviewSessionCreationError when createPreviewSession throws a code 10000 auth error",
			"should call handlePreviewSessionCreationError when createPreviewSession throws a code 9106 auth error",
			"should call handlePreviewSessionUploadError when createWorkerPreview throws a code 10000 auth error",
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
		file: "containers/push.test.ts",
		ancestors: ["containers push"],
		status: "todo",
		names: [
			"calls the shared push command with parsed args and account id",
			"passes a custom Docker path through to the shared command",
		],
	},
	{
		file: "d1/create.test.ts",
		ancestors: ["create"],
		status: "todo",
		names: ["should show all supported jurisdictions in help"],
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
		file: "deployment-bundle/source-maps.test.ts",
		ancestors: ["loadSourceMaps"],
		status: "skip",
		names: [
			"loads source maps from bundled metadata",
			"throws when bundled source map file is missing",
			"scans modules for sourceMappingURL when bundle has no metadata",
			"handles multiple modules with source maps in scan mode",
		],
	},
	{
		file: "deployment-bundle/source-maps.test.ts",
		ancestors: ["tryAttachSourcemapToModule"],
		status: "skip",
		names: [
			"attaches source map when module has file path and sourceMappingURL",
			"does nothing for non-js module types",
			"does nothing for virtual modules without filePath",
			"does nothing when module has no sourceMappingURL comment",
			"throws when sourceMappingURL points to missing file",
		],
	},
	{
		file: "experimental-config/load.test.ts",
		ancestors: ["loadNewConfig", "file presence"],
		status: "skip",
		names: [
			"throws a UserError when cloudflare.config.ts is missing",
			"loads cloudflare.config.ts alone (no wrangler.config.ts)",
			"loads both cloudflare.config.ts and wrangler.config.ts and merges them",
		],
	},
	{
		file: "experimental-config/load.test.ts",
		ancestors: ["loadNewConfig", "ctx.mode propagation"],
		status: "skip",
		names: [
			"passes args.env into the function-form cloudflare.config.ts",
			"falls back to CLOUDFLARE_ENV when args.env is not provided",
			"uses undefined when neither args.env nor CLOUDFLARE_ENV is set",
			"passes ctx.mode into the function-form wrangler.config.ts",
		],
	},
	{
		file: "experimental-config/load.test.ts",
		ancestors: ["loadNewConfig", "account settings"],
		status: "skip",
		names: [
			"threads accountId and complianceRegion from the default export",
			"leaves account settings undefined when they are omitted",
		],
	},
	{
		file: "experimental-config/load.test.ts",
		ancestors: ["loadNewConfig", "resources"],
		status: "skip",
		names: [
			"preserves the Containers array",
			"includes referenced Container definitions in the raw config",
			"throws when the config does not define a Worker",
		],
	},
	{
		file: "experimental-config/load.test.ts",
		ancestors: ["loadNewConfig", "worker schema validation"],
		status: "skip",
		names: [
			"throws when cloudflare.config.ts has invalid types",
			"formats Zod errors with dotted paths",
		],
	},
	{
		file: "experimental-config/load.test.ts",
		ancestors: ["loadNewConfig", "wrangler.config.ts schema validation"],
		status: "skip",
		names: [
			"throws when a Worker config field is used at the top level",
			"throws and lists supported keys for an unknown top-level field",
			"rejects wrong types for tooling fields",
		],
	},
	{
		file: "experimental-config/load.test.ts",
		ancestors: ["loadNewConfig", "assets merging"],
		status: "skip",
		names: [
			"merges worker-side asset binding/handling with tooling-side directory",
		],
	},
	{
		file: "experimental-config/load.test.ts",
		ancestors: ["loadNewConfig", "Email Routing"],
		status: "skip",
		names: ["loads email triggers as Wrangler addresses"],
	},
	{
		file: "experimental-config/load.test.ts",
		ancestors: ["loadNewConfig", "types.generate"],
		status: "skip",
		names: [
			"defaults to true when wrangler.config.ts is absent",
			"defaults to true when wrangler.config.ts is present but does not set it",
			"honors `types.generate: false`",
			"honors `types.includeRuntime: false`",
			"is not threaded into the merged raw config",
		],
	},
	{
		file: "experimental-config/load.test.ts",
		ancestors: ["loadNewConfig", "dependencies"],
		status: "skip",
		names: ["is the union of dependencies from both files"],
	},
	{
		file: "kv/namespace.test.ts",
		ancestors: ["kv", "namespace", "create"],
		status: "todo",
		names: ["should show the jurisdiction option in help"],
	},
	{
		file: "pages/delegate-to-workers.test.ts",
		ancestors: ["maybeDelegatePagesToWorkers"],
		status: "skip",
		names: [
			"does not delegate (or emit telemetry) when not run by an agent",
			"records an existing Pages project as ineligible",
			"does not delegate when the target project's existence is unknown",
			"delegates a new project even when the account already has other Pages projects",
			"does not delegate when a lazy projectExists resolver reports the project already exists",
			"delegates when a lazy projectExists resolver reports the project is new",
			"skips delegation when the projectExists lookup throws, leaving the command on Pages",
			"does not delegate when project has a functions directory",
			"does not delegate when project has a _worker.js",
			"does not delegate when project has a _routes.json",
			"does not delegate when the assets directory has unsupported markers",
			"delegates when project has a supported _redirects file",
			"delegates when the assets directory has a supported _redirects file",
			"delegates when project has a supported _headers file",
			"delegates when the assets directory has a supported _headers file",
			"does not delegate when Pages-only args are present",
			"delegates a brand-new static deploy to Workers",
			"carries the project name across to the Workers deploy",
			"does not forward --assets, so autoconfig stays enabled to configure the deploy",
			"carries name and compatibility settings across on create",
			"records a new opt-out result when --force prevents an eligible delegation",
			"records an ineligible --force command without flagging an opt-out",
			"emits a one-time, deploy-specific --force notice to stdout",
			"emits a one-time, create-specific --force notice to stdout",
			"records failure and gives explicit, loop-safe --force guidance",
			"gives create-specific --force guidance when a create delegation fails",
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
		file: "versions/versions.upload.test.ts",
		ancestors: ["versions upload"],
		status: "todo",
		names: ["should get the preview URL suffix from the Worker resource"],
	},
	{
		file: "versions/versions.upload.test.ts",
		ancestors: ["versions upload", "keep_vars"],
		status: "todo",
		names: [
			'keeps variables without generating Container image bindings: {"bindingName":"USER_IMAGES","containers":[]}',
			'keeps variables without generating Container image bindings: {"bindingName":"USER_IMAGES"}',
		],
	},
	{
		file: "versions/versions.upload.test.ts",
		ancestors: ["versions upload", "--dry-run"],
		status: "todo",
		names: ["categorises the positional path in command telemetry"],
	},
	{
		file: "versions/versions.upload.test.ts",
		ancestors: ["versions upload", "durable object migrations"],
		status: "todo",
		names: [
			"fails before uploading a version with pending migrations",
			"uploads managed images without updating an existing application (false)",
			"uploads managed images without updating an existing application (true)",
		],
	},
	{
		file: "versions/versions.upload.test.ts",
		ancestors: ["versions upload", "durable object exports (declarative)"],
		status: "todo",
		names: [
			"uploads a name-only managed Container export with 'populated' images and 'missing-namespace'",
			"uploads a name-only managed Container export with 'empty' images and 'missing-namespace'",
			"uploads a name-only managed Container export with 'empty' images and 'missing-app'",
			"uploads a name-only managed Container export with 'empty' images and 'exists'",
			"uploads a name-only managed Container export with 'empty' images and 'mismatch'",
			"uploads a name-only managed Container export with 'empty' images and 'forbidden'",
			"rejects an image-less Container missing its namespace before preparing other images",
			"rejects an image-less Container missing its application before preparing other images",
		],
	},
	{
		file: "versions/versions.upload.test.ts",
		ancestors: ["versions upload", "workflow exports"],
		status: "todo",
		names: [
			"sends workflow exports by name without provisioning the Workflow",
			"rejects a binding and an export that declare the same Workflow with different classes",
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
