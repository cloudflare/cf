// Generated from cloudflare/workers-sdk@c2bb4c815. Do not rename cases.
import { describe, it } from "vitest";

const groups = [
	{
		file: "api/startDevWorker/ConfigController.test.ts",
		ancestors: ["ConfigController"],
		status: "skip",
		names: [
			"should prompt user to update types if they're out of date",
			"should use account_id from config file before env var",
			"should emit configUpdate events with defaults applied",
			"should map UDP connect options for the local runtime",
			"should plan named Container images for local runtime",
			"should not plan named Container images in remote mode",
			"should not plan Container images when Containers are disabled",
			"should accept wrangler-specific dev fields through the public input",
			"runs a programmatic custom build command supplied only through input.build.custom",
			"should derive nodejsCompatMode from the config like the CLI",
			"should apply module root to parent if main is nested from base_dir",
			"should shallow merge patched config",
			"should only log warnings once even with multiple config updates",
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
		file: "cloudchamber/build.test.ts",
		ancestors: ["containers build"],
		status: "skip",
		names: [
			"calls the shared build command with parsed args",
			"passes a custom Docker path through to the shared command",
		],
	},
	{
		file: "config-schema.test.ts",
		ancestors: ["config schema"],
		status: "skip",
		names: [
			"keeps allowTrailingCommas off the root $ref",
			"describes every migration operation wrangler accepts",
			"includes Durable Object code update strategy configuration",
			"includes Durable Object-managed container configuration",
		],
	},
	{
		file: "core/output-stream-errors.test.ts",
		ancestors: ["registerOutputStreamErrorHandler"],
		status: "todo",
		names: [
			"keeps the process alive when an output consumer closes the pipe",
			"does not swallow unrelated output errors",
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
		file: "deploy/deploy-interactive-prompts.test.ts",
		ancestors: ["deploy: interactive deploy config prompts"],
		status: "skip",
		names: [
			"should prompt and use the default compatibility date when user confirms",
			"should error when user declines the compatibility date prompt",
			"should error in non-interactive mode when no compatibility_date is provided",
			"should not show config-write prompt when config file already exists",
			"should skip the compat date prompt when --latest is passed",
			"should prompt for name, compat date, and offer to write config when no config file exists",
			"should show suggested CLI flags when user declines config file write",
			"should write config with the default compat date when --latest is used and no config file exists",
			"should include compat date in suggested CLI command when --latest is used and config write declined",
			"should prompt for name when config file exists but has no name",
			"should use the project name without prompting when run by an agent",
			"should not prompt for name when config file provides one",
			"should include compatibility_flags in generated wrangler.jsonc when --compatibility-flags is passed",
			"should include --compatibility-flags in suggested CLI command when user declines config file write",
			"should include multiple --compatibility-flags in suggested CLI command and config file",
			"should include routes in generated wrangler.jsonc when --routes is passed",
			"should include zone_name routes in generated wrangler.jsonc when --routes and --zone are passed",
			"should include --zone in suggested CLI command when user declines config file write",
			"should include --routes in suggested CLI command when user declines config file write",
			"should include domains as custom_domain routes in generated wrangler.jsonc when --domains is passed",
			"should include --domains in suggested CLI command when user declines config file write",
			"should merge --routes and --domains into routes array in generated wrangler.jsonc",
			"should include triggers in generated wrangler.jsonc when --triggers is passed",
			"should include --triggers in suggested CLI command when user declines config file write",
			"should include vars in generated wrangler.jsonc when --var is passed",
			"should include --var in suggested CLI command when user declines config file write",
			"should include define in generated wrangler.jsonc when --define is passed",
			"should include --define in suggested CLI command when user declines config file write",
			"should include alias in generated wrangler.jsonc when --alias is passed",
			"should include jsx_factory in generated wrangler.jsonc when --jsx-factory is passed",
			"should include jsx_fragment in generated wrangler.jsonc when --jsx-fragment is passed",
			"should include tsconfig in generated wrangler.jsonc when --tsconfig is passed",
			"should include minify in generated wrangler.jsonc when --minify is passed",
			"should include --minify in suggested CLI command when user declines config file write",
			"should include upload_source_maps in generated wrangler.jsonc when --upload-source-maps is passed",
			"should include no_bundle in generated wrangler.jsonc when --no-bundle is passed",
			"should include logpush in generated wrangler.jsonc when --logpush is passed",
			"should include keep_vars in generated wrangler.jsonc when --keep-vars is passed",
			"should include --keep-vars in suggested CLI command when user declines config file write",
			"should include --dispatch-namespace in suggested CLI command when user declines config file write",
			"should include multiple flags in generated wrangler.jsonc and suggested CLI command",
			"should include multiple flags in suggested CLI command when user declines config file write",
		],
	},
	{
		file: "deploy/open-next.test.ts",
		ancestors: ["deploy", "open-next delegation"],
		status: "skip",
		names: [
			"should delegate to open-next when run in an open-next project and set OPEN_NEXT_DEPLOY",
			"should delegate to open-next when run in an open-next project and set OPEN_NEXT_DEPLOY and pass the various CLI arguments",
			"should not delegate to open-next deploy when run in an open-next project and OPEN_NEXT_DEPLOY is set",
			"should not delegate to open-next deploy when --no-autoconfig is provided",
			"should not delegate to open-next deploy when the Next.js config file is missing (to avoid false positives)",
			"should not delegate to open-next deploy when the open-next config file is missing (to avoid false positives)",
			"should not delegate to open-next deploy when --config is explicitly provided",
			"should not delegate to open-next deploy when Pages-to-Workers delegation is running",
		],
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
		file: "metrics/sanitization.test.ts",
		ancestors: ["sanitizeArgKeys"],
		status: "skip",
		names: ["should sanitize arg keys based on argv"],
	},
	{
		file: "metrics/sanitization.test.ts",
		ancestors: ["sanitizeArgValues"],
		status: "skip",
		names: ["should redact and allow arg values based on allowedArgs"],
	},
	{
		file: "metrics/sanitization.test.ts",
		ancestors: ["getAllowedArgs"],
		status: "skip",
		names: [
			"should return allowed args for a given command",
			"should allow more specific command rules to override less specific ones",
		],
	},
	{
		file: "metrics/sanitization.test.ts",
		ancestors: ["categorisePositionalPath"],
		status: "skip",
		names: [
			"returns null when no value is provided",
			"categorises the current directory reference",
			"categorises parent-relative references",
			"categorises an existing directory",
			"categorises an existing file",
			"categorises a path that does not exist as not-found",
		],
	},
	{
		file: "metrics/sanitization.test.ts",
		ancestors: ["categoriseArgs"],
		status: "skip",
		names: [
			"only categorises args whose allow-list entry is a categoriser",
			"reads positional values straight from the full args object",
			"records null when a positional is absent",
			"omits args when the categoriser returns undefined",
		],
	},
	{
		file: "metrics/sanitization.test.ts",
		ancestors: ["COMMAND_ARG_ALLOW_LIST"],
		status: "skip",
		names: [
			"omits event codes from deploy telemetry",
			"should pass boolean flag values through the full sanitisation pipeline for any command",
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
			"skips provisioning a resource type when Wrangler cannot check whether it exists",
			"fails provisioning when a resource check fails with a non-permission error",
			"warns after a successful deploy when every provisionable binding skipped provisioning",
			"does not inherit from an existing D1 binding when a permission error prevents checking the configured database name",
			"preserves an explicitly configured resource name when the provisioning picker cannot load resources",
			"preserves skipped binding array positions when a later binding of the same type provisions successfully",
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
		file: "turnstile.test.ts",
		ancestors: ["turnstile widget commands"],
		status: "todo",
		names: [
			"creates a widget with required args",
			"errors when --mode is missing",
		],
	},
	{
		file: "utils/format-message.test.ts",
		ancestors: ["formatMessage"],
		status: "skip",
		names: [
			"should format message without location",
			"should format message with location",
			"should format message with location and notes",
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
