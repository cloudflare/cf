import operation from "../_operations/pages/edit.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * edit command
 * @generated from apis/overlays/pages.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 pages edit <project-name>\n\nUpdate the build, deployment, source, or environment settings for a Cloudflare Pages project. To delete an environment variable, set its key to `null`."
		)
		.positional("project-name", {
			type: "string",
			description:
				"Name of the Pages project. Must begin with a lowercase letter or digit and contain only lowercase letters, digits, and hyphens.",
			demandOption: true,
		})
		.option("build-config-build-caching", {
			type: "boolean",
			description: "Enable build caching for the project.",
		})
		.option("build-config-build-command", {
			type: "string",
			description: "Command used to build project.",
		})
		.option("build-config-destination-dir", {
			type: "string",
			description: "Output directory of the build.",
		})
		.option("build-config-root-dir", {
			type: "string",
			description: "Directory to run the command.",
		})
		.option("build-config-web-analytics-tag", {
			type: "string",
			description: "The classifying tag for analytics.",
		})
		.option("build-config-web-analytics-token", {
			type: "string",
			description: "The auth token for analytics.",
		})
		.option("deployment-configs-preview-ai-bindings", {
			type: "string",
			description:
				"Constellation bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option("deployment-configs-preview-always-use-latest-compatibility-date", {
			type: "boolean",
			description:
				"Whether to always use the latest compatibility date for Pages Functions.",
		})
		.option("deployment-configs-preview-analytics-engine-datasets", {
			type: "string",
			description:
				"Analytics Engine bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option("deployment-configs-preview-browsers", {
			type: "string",
			description:
				"Browser bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option("deployment-configs-preview-build-image-major-version", {
			type: "number",
			description:
				"The major version of the build image to use for Pages Functions. Version 1 is retired and its projects are moved to version 3. Once a project's builds have been moved, a request that sets version 1 is rejected.",
		})
		.option("deployment-configs-preview-compatibility-date", {
			type: "string",
			description: "Compatibility date used for Pages Functions.",
		})
		.option("deployment-configs-preview-compatibility-flags", {
			type: "string",
			array: true,
			description: "Compatibility flags used for Pages Functions.",
		})
		.option("deployment-configs-preview-d1-databases", {
			type: "string",
			description:
				"D1 databases used for Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option("deployment-configs-preview-durable-object-namespaces", {
			type: "string",
			description:
				"Durable Object namespaces used for Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option("deployment-configs-preview-env-vars", {
			type: "string",
			description:
				"Environment variables used for builds and Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option("deployment-configs-preview-fail-open", {
			type: "boolean",
			description:
				"Whether to fail open when the deployment config cannot be applied.",
		})
		.option("deployment-configs-preview-hyperdrive-bindings", {
			type: "string",
			description:
				"Hyperdrive bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option("deployment-configs-preview-kv-namespaces", {
			type: "string",
			description:
				"KV namespaces used for Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option("deployment-configs-preview-limits-cpu-ms", {
			type: "number",
			description: "CPU time limit in milliseconds.",
		})
		.option("deployment-configs-preview-mtls-certificates", {
			type: "string",
			description:
				"mTLS bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option("deployment-configs-preview-placement-mode", {
			type: "string",
			description: "Placement mode.",
		})
		.option("deployment-configs-preview-queue-producers", {
			type: "string",
			description:
				"Queue Producer bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option("deployment-configs-preview-r2-buckets", {
			type: "string",
			description:
				"R2 buckets used for Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option("deployment-configs-preview-services", {
			type: "string",
			description:
				"Services used for Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option("deployment-configs-preview-usage-model", {
			type: "string",
			description: "The usage model for Pages Functions.",
			choices: ["standard", "bundled", "unbound"],
		})
		.coerce("deployment-configs-preview-usage-model", (value) =>
			resolveFileToken(value, "deployment-configs-preview-usage-model", "text")
		)
		.option("deployment-configs-preview-vectorize-bindings", {
			type: "string",
			description:
				"Vectorize bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option("deployment-configs-preview-wrangler-config-hash", {
			type: "string",
			description:
				"Hash of the Wrangler configuration used for the deployment.",
		})
		.option("deployment-configs-production-ai-bindings", {
			type: "string",
			description:
				"Constellation bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option(
			"deployment-configs-production-always-use-latest-compatibility-date",
			{
				type: "boolean",
				description:
					"Whether to always use the latest compatibility date for Pages Functions.",
			}
		)
		.option("deployment-configs-production-analytics-engine-datasets", {
			type: "string",
			description:
				"Analytics Engine bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option("deployment-configs-production-browsers", {
			type: "string",
			description:
				"Browser bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option("deployment-configs-production-build-image-major-version", {
			type: "number",
			description:
				"The major version of the build image to use for Pages Functions. Version 1 is retired and its projects are moved to version 3. Once a project's builds have been moved, a request that sets version 1 is rejected.",
		})
		.option("deployment-configs-production-compatibility-date", {
			type: "string",
			description: "Compatibility date used for Pages Functions.",
		})
		.option("deployment-configs-production-compatibility-flags", {
			type: "string",
			array: true,
			description: "Compatibility flags used for Pages Functions.",
		})
		.option("deployment-configs-production-d1-databases", {
			type: "string",
			description:
				"D1 databases used for Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option("deployment-configs-production-durable-object-namespaces", {
			type: "string",
			description:
				"Durable Object namespaces used for Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option("deployment-configs-production-env-vars", {
			type: "string",
			description:
				"Environment variables used for builds and Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option("deployment-configs-production-fail-open", {
			type: "boolean",
			description:
				"Whether to fail open when the deployment config cannot be applied.",
		})
		.option("deployment-configs-production-hyperdrive-bindings", {
			type: "string",
			description:
				"Hyperdrive bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option("deployment-configs-production-kv-namespaces", {
			type: "string",
			description:
				"KV namespaces used for Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option("deployment-configs-production-limits-cpu-ms", {
			type: "number",
			description: "CPU time limit in milliseconds.",
		})
		.option("deployment-configs-production-mtls-certificates", {
			type: "string",
			description:
				"mTLS bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option("deployment-configs-production-placement-mode", {
			type: "string",
			description: "Placement mode.",
		})
		.option("deployment-configs-production-queue-producers", {
			type: "string",
			description:
				"Queue Producer bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option("deployment-configs-production-r2-buckets", {
			type: "string",
			description:
				"R2 buckets used for Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option("deployment-configs-production-services", {
			type: "string",
			description:
				"Services used for Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option("deployment-configs-production-usage-model", {
			type: "string",
			description: "The usage model for Pages Functions.",
			choices: ["standard", "bundled", "unbound"],
		})
		.coerce("deployment-configs-production-usage-model", (value) =>
			resolveFileToken(
				value,
				"deployment-configs-production-usage-model",
				"text"
			)
		)
		.option("deployment-configs-production-vectorize-bindings", {
			type: "string",
			description:
				"Vectorize bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json.",
		})
		.option("deployment-configs-production-wrangler-config-hash", {
			type: "string",
			description:
				"Hash of the Wrangler configuration used for the deployment.",
		})
		.option("name", {
			type: "string",
			description:
				"Name for the Pages project. Must begin with a lowercase letter or digit and contain only lowercase letters, digits, and hyphens.",
		})
		.option("production-branch", {
			type: "string",
			description:
				"Production branch of the project. Used to identify production deployments.",
		})
		.option("source-config-deployments-enabled", {
			type: "boolean",
			description:
				"Whether to enable automatic deployments when pushing to the source repository.\nWhen disabled, no deployments (production or preview) will be triggered automatically.\n",
		})
		.option("source-config-owner", {
			type: "string",
			description: "The owner of the repository.",
		})
		.option("source-config-owner-id", {
			type: "string",
			description: "The owner ID of the repository.",
		})
		.option("source-config-path-excludes", {
			type: "string",
			array: true,
			description:
				"A list of paths that should be excluded from triggering a preview deployment. Wildcard syntax (`*`) is supported.",
		})
		.option("source-config-path-includes", {
			type: "string",
			array: true,
			description:
				"A list of paths that should be watched to trigger a preview deployment. Wildcard syntax (`*`) is supported.",
		})
		.option("source-config-pr-comments-enabled", {
			type: "boolean",
			description: "Whether to enable PR comments.",
		})
		.option("source-config-preview-branch-excludes", {
			type: "string",
			array: true,
			description:
				"A list of branches that should not trigger a preview deployment. Wildcard syntax (`*`) is supported. Must be used with `preview_deployment_setting` set to `custom`.",
		})
		.option("source-config-preview-branch-includes", {
			type: "string",
			array: true,
			description:
				"A list of branches that should trigger a preview deployment. Wildcard syntax (`*`) is supported. Must be used with `preview_deployment_setting` set to `custom`.",
		})
		.option("source-config-preview-deployment-setting", {
			type: "string",
			description:
				"Controls whether commits to preview branches trigger a preview deployment.",
			choices: ["all", "none", "custom"],
		})
		.coerce("source-config-preview-deployment-setting", (value) =>
			resolveFileToken(
				value,
				"source-config-preview-deployment-setting",
				"text"
			)
		)
		.option("source-config-production-branch", {
			type: "string",
			description: "The production branch of the repository.",
		})
		.option("source-config-production-deployments-enabled", {
			type: "boolean",
			description:
				"Whether to trigger a production deployment on commits to the production branch.",
		})
		.option("source-config-repo-id", {
			type: "string",
			description: "The ID of the repository.",
		})
		.option("source-config-repo-name", {
			type: "string",
			description: "The name of the repository.",
		})
		.option("source-type", {
			type: "string",
			description: "The source control management provider.",
			choices: ["github", "gitlab"],
		})
		.coerce("source-type", (value) =>
			resolveFileToken(value, "source-type", "text")
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.check((argv) => {
			const groupSet = [
				"deployment-configs-preview-ai-bindings",
				"deployment-configs-preview-always-use-latest-compatibility-date",
				"deployment-configs-preview-analytics-engine-datasets",
				"deployment-configs-preview-browsers",
				"deployment-configs-preview-build-image-major-version",
				"deployment-configs-preview-compatibility-date",
				"deployment-configs-preview-compatibility-flags",
				"deployment-configs-preview-d1-databases",
				"deployment-configs-preview-durable-object-namespaces",
				"deployment-configs-preview-env-vars",
				"deployment-configs-preview-fail-open",
				"deployment-configs-preview-hyperdrive-bindings",
				"deployment-configs-preview-kv-namespaces",
				"deployment-configs-preview-limits-cpu-ms",
				"deployment-configs-preview-mtls-certificates",
				"deployment-configs-preview-placement-mode",
				"deployment-configs-preview-queue-producers",
				"deployment-configs-preview-r2-buckets",
				"deployment-configs-preview-services",
				"deployment-configs-preview-usage-model",
				"deployment-configs-preview-vectorize-bindings",
				"deployment-configs-preview-wrangler-config-hash",
				"deployment-configs-production-ai-bindings",
				"deployment-configs-production-always-use-latest-compatibility-date",
				"deployment-configs-production-analytics-engine-datasets",
				"deployment-configs-production-browsers",
				"deployment-configs-production-build-image-major-version",
				"deployment-configs-production-compatibility-date",
				"deployment-configs-production-compatibility-flags",
				"deployment-configs-production-d1-databases",
				"deployment-configs-production-durable-object-namespaces",
				"deployment-configs-production-env-vars",
				"deployment-configs-production-fail-open",
				"deployment-configs-production-hyperdrive-bindings",
				"deployment-configs-production-kv-namespaces",
				"deployment-configs-production-limits-cpu-ms",
				"deployment-configs-production-mtls-certificates",
				"deployment-configs-production-placement-mode",
				"deployment-configs-production-queue-producers",
				"deployment-configs-production-r2-buckets",
				"deployment-configs-production-services",
				"deployment-configs-production-usage-model",
				"deployment-configs-production-vectorize-bindings",
				"deployment-configs-production-wrangler-config-hash",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = [
					"deployment-configs-preview-limits-cpu-ms",
					"deployment-configs-preview-placement-mode",
					"deployment-configs-production-limits-cpu-ms",
					"deployment-configs-production-placement-mode",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --deployment_configs-* flag is set`
					);
				}
			}
			return true;
		})
		.check((argv) => {
			const groupSet = [
				"source-config-deployments-enabled",
				"source-config-owner",
				"source-config-owner-id",
				"source-config-path-excludes",
				"source-config-path-includes",
				"source-config-pr-comments-enabled",
				"source-config-preview-branch-excludes",
				"source-config-preview-branch-includes",
				"source-config-preview-deployment-setting",
				"source-config-production-branch",
				"source-config-production-deployments-enabled",
				"source-config-repo-id",
				"source-config-repo-name",
				"source-type",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = ["source-type"].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --source-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <project-name>",
	describe: "Update a Cloudflare Pages project",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "pages edit",
				classification: {
					safeFlags: [
						"build-config-build-caching",
						"deployment-configs-preview-always-use-latest-compatibility-date",
						"deployment-configs-preview-fail-open",
						"deployment-configs-preview-usage-model",
						"deployment-configs-production-always-use-latest-compatibility-date",
						"deployment-configs-production-fail-open",
						"deployment-configs-production-usage-model",
						"source-config-deployments-enabled",
						"source-config-pr-comments-enabled",
						"source-config-preview-deployment-setting",
						"source-config-production-deployments-enabled",
						"source-type",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf pages edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pages/projects/${argv["project-name"] == null ? "<project-name>" : encodeURIComponent(String(argv["project-name"]))}`,
						pathParams: { "project-name": String(argv["project-name"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											build_config: {
												build_caching: argv["build-config-build-caching"],
												build_command: resolveFileToken(
													argv["build-config-build-command"] as
														| string
														| undefined,
													"build-config-build-command",
													"text"
												),
												destination_dir: resolveFileToken(
													argv["build-config-destination-dir"] as
														| string
														| undefined,
													"build-config-destination-dir",
													"text"
												),
												root_dir: resolveFileToken(
													argv["build-config-root-dir"] as string | undefined,
													"build-config-root-dir",
													"text"
												),
												web_analytics_tag: resolveFileToken(
													argv["build-config-web-analytics-tag"] as
														| string
														| undefined,
													"build-config-web-analytics-tag",
													"text"
												),
												web_analytics_token: resolveFileToken(
													argv["build-config-web-analytics-token"] as
														| string
														| undefined,
													"build-config-web-analytics-token",
													"text"
												),
											},
											deployment_configs: {
												preview: {
													ai_bindings: parseJsonMap(
														argv["deployment-configs-preview-ai-bindings"],
														"deployment-configs-preview-ai-bindings"
													),
													always_use_latest_compatibility_date:
														argv[
															"deployment-configs-preview-always-use-latest-compatibility-date"
														],
													analytics_engine_datasets: parseJsonMap(
														argv[
															"deployment-configs-preview-analytics-engine-datasets"
														],
														"deployment-configs-preview-analytics-engine-datasets"
													),
													browsers: parseJsonMap(
														argv["deployment-configs-preview-browsers"],
														"deployment-configs-preview-browsers"
													),
													build_image_major_version:
														argv[
															"deployment-configs-preview-build-image-major-version"
														],
													compatibility_date: resolveFileToken(
														argv[
															"deployment-configs-preview-compatibility-date"
														] as string | undefined,
														"deployment-configs-preview-compatibility-date",
														"text"
													),
													compatibility_flags:
														argv[
															"deployment-configs-preview-compatibility-flags"
														],
													d1_databases: parseJsonMap(
														argv["deployment-configs-preview-d1-databases"],
														"deployment-configs-preview-d1-databases"
													),
													durable_object_namespaces: parseJsonMap(
														argv[
															"deployment-configs-preview-durable-object-namespaces"
														],
														"deployment-configs-preview-durable-object-namespaces"
													),
													env_vars: parseJsonMap(
														argv["deployment-configs-preview-env-vars"],
														"deployment-configs-preview-env-vars"
													),
													fail_open:
														argv["deployment-configs-preview-fail-open"],
													hyperdrive_bindings: parseJsonMap(
														argv[
															"deployment-configs-preview-hyperdrive-bindings"
														],
														"deployment-configs-preview-hyperdrive-bindings"
													),
													kv_namespaces: parseJsonMap(
														argv["deployment-configs-preview-kv-namespaces"],
														"deployment-configs-preview-kv-namespaces"
													),
													limits: {
														cpu_ms:
															argv["deployment-configs-preview-limits-cpu-ms"],
													},
													mtls_certificates: parseJsonMap(
														argv[
															"deployment-configs-preview-mtls-certificates"
														],
														"deployment-configs-preview-mtls-certificates"
													),
													placement: {
														mode: resolveFileToken(
															argv[
																"deployment-configs-preview-placement-mode"
															] as string | undefined,
															"deployment-configs-preview-placement-mode",
															"text"
														),
													},
													queue_producers: parseJsonMap(
														argv["deployment-configs-preview-queue-producers"],
														"deployment-configs-preview-queue-producers"
													),
													r2_buckets: parseJsonMap(
														argv["deployment-configs-preview-r2-buckets"],
														"deployment-configs-preview-r2-buckets"
													),
													services: parseJsonMap(
														argv["deployment-configs-preview-services"],
														"deployment-configs-preview-services"
													),
													usage_model:
														argv["deployment-configs-preview-usage-model"],
													vectorize_bindings: parseJsonMap(
														argv[
															"deployment-configs-preview-vectorize-bindings"
														],
														"deployment-configs-preview-vectorize-bindings"
													),
													wrangler_config_hash: resolveFileToken(
														argv[
															"deployment-configs-preview-wrangler-config-hash"
														] as string | undefined,
														"deployment-configs-preview-wrangler-config-hash",
														"text"
													),
												},
												production: {
													ai_bindings: parseJsonMap(
														argv["deployment-configs-production-ai-bindings"],
														"deployment-configs-production-ai-bindings"
													),
													always_use_latest_compatibility_date:
														argv[
															"deployment-configs-production-always-use-latest-compatibility-date"
														],
													analytics_engine_datasets: parseJsonMap(
														argv[
															"deployment-configs-production-analytics-engine-datasets"
														],
														"deployment-configs-production-analytics-engine-datasets"
													),
													browsers: parseJsonMap(
														argv["deployment-configs-production-browsers"],
														"deployment-configs-production-browsers"
													),
													build_image_major_version:
														argv[
															"deployment-configs-production-build-image-major-version"
														],
													compatibility_date: resolveFileToken(
														argv[
															"deployment-configs-production-compatibility-date"
														] as string | undefined,
														"deployment-configs-production-compatibility-date",
														"text"
													),
													compatibility_flags:
														argv[
															"deployment-configs-production-compatibility-flags"
														],
													d1_databases: parseJsonMap(
														argv["deployment-configs-production-d1-databases"],
														"deployment-configs-production-d1-databases"
													),
													durable_object_namespaces: parseJsonMap(
														argv[
															"deployment-configs-production-durable-object-namespaces"
														],
														"deployment-configs-production-durable-object-namespaces"
													),
													env_vars: parseJsonMap(
														argv["deployment-configs-production-env-vars"],
														"deployment-configs-production-env-vars"
													),
													fail_open:
														argv["deployment-configs-production-fail-open"],
													hyperdrive_bindings: parseJsonMap(
														argv[
															"deployment-configs-production-hyperdrive-bindings"
														],
														"deployment-configs-production-hyperdrive-bindings"
													),
													kv_namespaces: parseJsonMap(
														argv["deployment-configs-production-kv-namespaces"],
														"deployment-configs-production-kv-namespaces"
													),
													limits: {
														cpu_ms:
															argv[
																"deployment-configs-production-limits-cpu-ms"
															],
													},
													mtls_certificates: parseJsonMap(
														argv[
															"deployment-configs-production-mtls-certificates"
														],
														"deployment-configs-production-mtls-certificates"
													),
													placement: {
														mode: resolveFileToken(
															argv[
																"deployment-configs-production-placement-mode"
															] as string | undefined,
															"deployment-configs-production-placement-mode",
															"text"
														),
													},
													queue_producers: parseJsonMap(
														argv[
															"deployment-configs-production-queue-producers"
														],
														"deployment-configs-production-queue-producers"
													),
													r2_buckets: parseJsonMap(
														argv["deployment-configs-production-r2-buckets"],
														"deployment-configs-production-r2-buckets"
													),
													services: parseJsonMap(
														argv["deployment-configs-production-services"],
														"deployment-configs-production-services"
													),
													usage_model:
														argv["deployment-configs-production-usage-model"],
													vectorize_bindings: parseJsonMap(
														argv[
															"deployment-configs-production-vectorize-bindings"
														],
														"deployment-configs-production-vectorize-bindings"
													),
													wrangler_config_hash: resolveFileToken(
														argv[
															"deployment-configs-production-wrangler-config-hash"
														] as string | undefined,
														"deployment-configs-production-wrangler-config-hash",
														"text"
													),
												},
											},
											name: resolveFileToken(
												argv["name"] as string | undefined,
												"name",
												"text"
											),
											production_branch: resolveFileToken(
												argv["production-branch"] as string | undefined,
												"production-branch",
												"text"
											),
											source: {
												config: {
													deployments_enabled:
														argv["source-config-deployments-enabled"],
													owner: resolveFileToken(
														argv["source-config-owner"] as string | undefined,
														"source-config-owner",
														"text"
													),
													owner_id: resolveFileToken(
														argv["source-config-owner-id"] as
															| string
															| undefined,
														"source-config-owner-id",
														"text"
													),
													path_excludes: argv["source-config-path-excludes"],
													path_includes: argv["source-config-path-includes"],
													pr_comments_enabled:
														argv["source-config-pr-comments-enabled"],
													preview_branch_excludes:
														argv["source-config-preview-branch-excludes"],
													preview_branch_includes:
														argv["source-config-preview-branch-includes"],
													preview_deployment_setting:
														argv["source-config-preview-deployment-setting"],
													production_branch: resolveFileToken(
														argv["source-config-production-branch"] as
															| string
															| undefined,
														"source-config-production-branch",
														"text"
													),
													production_deployments_enabled:
														argv[
															"source-config-production-deployments-enabled"
														],
													repo_id: resolveFileToken(
														argv["source-config-repo-id"] as string | undefined,
														"source-config-repo-id",
														"text"
													),
													repo_name: resolveFileToken(
														argv["source-config-repo-name"] as
															| string
															| undefined,
														"source-config-repo-name",
														"text"
													),
												},
												type: argv["source-type"],
											},
										},
										[
											["deployment_configs", "preview", "ai_bindings"],
											[
												"deployment_configs",
												"preview",
												"analytics_engine_datasets",
											],
											["deployment_configs", "preview", "browsers"],
											["deployment_configs", "preview", "d1_databases"],
											[
												"deployment_configs",
												"preview",
												"durable_object_namespaces",
											],
											["deployment_configs", "preview", "env_vars"],
											["deployment_configs", "preview", "hyperdrive_bindings"],
											["deployment_configs", "preview", "kv_namespaces"],
											["deployment_configs", "preview", "mtls_certificates"],
											["deployment_configs", "preview", "queue_producers"],
											["deployment_configs", "preview", "r2_buckets"],
											["deployment_configs", "preview", "services"],
											["deployment_configs", "preview", "vectorize_bindings"],
											["deployment_configs", "production", "ai_bindings"],
											[
												"deployment_configs",
												"production",
												"analytics_engine_datasets",
											],
											["deployment_configs", "production", "browsers"],
											["deployment_configs", "production", "d1_databases"],
											[
												"deployment_configs",
												"production",
												"durable_object_namespaces",
											],
											["deployment_configs", "production", "env_vars"],
											[
												"deployment_configs",
												"production",
												"hyperdrive_bindings",
											],
											["deployment_configs", "production", "kv_namespaces"],
											["deployment_configs", "production", "mtls_certificates"],
											["deployment_configs", "production", "queue_producers"],
											["deployment_configs", "production", "r2_buckets"],
											["deployment_configs", "production", "services"],
											[
												"deployment_configs",
												"production",
												"vectorize_bindings",
											],
										]
									),
						sensitiveBodyPaths: [["build_config", "web_analytics_token"]],
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							project_name: argv["project-name"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						build_config: {
							build_caching: argv["build-config-build-caching"],
							build_command: resolveFileToken(
								argv["build-config-build-command"] as string | undefined,
								"build-config-build-command",
								"text"
							),
							destination_dir: resolveFileToken(
								argv["build-config-destination-dir"] as string | undefined,
								"build-config-destination-dir",
								"text"
							),
							root_dir: resolveFileToken(
								argv["build-config-root-dir"] as string | undefined,
								"build-config-root-dir",
								"text"
							),
							web_analytics_tag: resolveFileToken(
								argv["build-config-web-analytics-tag"] as string | undefined,
								"build-config-web-analytics-tag",
								"text"
							),
							web_analytics_token: resolveFileToken(
								argv["build-config-web-analytics-token"] as string | undefined,
								"build-config-web-analytics-token",
								"text"
							),
						},
						deployment_configs: {
							preview: {
								ai_bindings: parseJsonMap(
									argv["deployment-configs-preview-ai-bindings"],
									"deployment-configs-preview-ai-bindings"
								),
								always_use_latest_compatibility_date:
									argv[
										"deployment-configs-preview-always-use-latest-compatibility-date"
									],
								analytics_engine_datasets: parseJsonMap(
									argv["deployment-configs-preview-analytics-engine-datasets"],
									"deployment-configs-preview-analytics-engine-datasets"
								),
								browsers: parseJsonMap(
									argv["deployment-configs-preview-browsers"],
									"deployment-configs-preview-browsers"
								),
								build_image_major_version:
									argv["deployment-configs-preview-build-image-major-version"],
								compatibility_date: resolveFileToken(
									argv["deployment-configs-preview-compatibility-date"] as
										| string
										| undefined,
									"deployment-configs-preview-compatibility-date",
									"text"
								),
								compatibility_flags:
									argv["deployment-configs-preview-compatibility-flags"],
								d1_databases: parseJsonMap(
									argv["deployment-configs-preview-d1-databases"],
									"deployment-configs-preview-d1-databases"
								),
								durable_object_namespaces: parseJsonMap(
									argv["deployment-configs-preview-durable-object-namespaces"],
									"deployment-configs-preview-durable-object-namespaces"
								),
								env_vars: parseJsonMap(
									argv["deployment-configs-preview-env-vars"],
									"deployment-configs-preview-env-vars"
								),
								fail_open: argv["deployment-configs-preview-fail-open"],
								hyperdrive_bindings: parseJsonMap(
									argv["deployment-configs-preview-hyperdrive-bindings"],
									"deployment-configs-preview-hyperdrive-bindings"
								),
								kv_namespaces: parseJsonMap(
									argv["deployment-configs-preview-kv-namespaces"],
									"deployment-configs-preview-kv-namespaces"
								),
								limits: {
									cpu_ms: argv["deployment-configs-preview-limits-cpu-ms"],
								},
								mtls_certificates: parseJsonMap(
									argv["deployment-configs-preview-mtls-certificates"],
									"deployment-configs-preview-mtls-certificates"
								),
								placement: {
									mode: resolveFileToken(
										argv["deployment-configs-preview-placement-mode"] as
											| string
											| undefined,
										"deployment-configs-preview-placement-mode",
										"text"
									),
								},
								queue_producers: parseJsonMap(
									argv["deployment-configs-preview-queue-producers"],
									"deployment-configs-preview-queue-producers"
								),
								r2_buckets: parseJsonMap(
									argv["deployment-configs-preview-r2-buckets"],
									"deployment-configs-preview-r2-buckets"
								),
								services: parseJsonMap(
									argv["deployment-configs-preview-services"],
									"deployment-configs-preview-services"
								),
								usage_model: argv["deployment-configs-preview-usage-model"],
								vectorize_bindings: parseJsonMap(
									argv["deployment-configs-preview-vectorize-bindings"],
									"deployment-configs-preview-vectorize-bindings"
								),
								wrangler_config_hash: resolveFileToken(
									argv["deployment-configs-preview-wrangler-config-hash"] as
										| string
										| undefined,
									"deployment-configs-preview-wrangler-config-hash",
									"text"
								),
							},
							production: {
								ai_bindings: parseJsonMap(
									argv["deployment-configs-production-ai-bindings"],
									"deployment-configs-production-ai-bindings"
								),
								always_use_latest_compatibility_date:
									argv[
										"deployment-configs-production-always-use-latest-compatibility-date"
									],
								analytics_engine_datasets: parseJsonMap(
									argv[
										"deployment-configs-production-analytics-engine-datasets"
									],
									"deployment-configs-production-analytics-engine-datasets"
								),
								browsers: parseJsonMap(
									argv["deployment-configs-production-browsers"],
									"deployment-configs-production-browsers"
								),
								build_image_major_version:
									argv[
										"deployment-configs-production-build-image-major-version"
									],
								compatibility_date: resolveFileToken(
									argv["deployment-configs-production-compatibility-date"] as
										| string
										| undefined,
									"deployment-configs-production-compatibility-date",
									"text"
								),
								compatibility_flags:
									argv["deployment-configs-production-compatibility-flags"],
								d1_databases: parseJsonMap(
									argv["deployment-configs-production-d1-databases"],
									"deployment-configs-production-d1-databases"
								),
								durable_object_namespaces: parseJsonMap(
									argv[
										"deployment-configs-production-durable-object-namespaces"
									],
									"deployment-configs-production-durable-object-namespaces"
								),
								env_vars: parseJsonMap(
									argv["deployment-configs-production-env-vars"],
									"deployment-configs-production-env-vars"
								),
								fail_open: argv["deployment-configs-production-fail-open"],
								hyperdrive_bindings: parseJsonMap(
									argv["deployment-configs-production-hyperdrive-bindings"],
									"deployment-configs-production-hyperdrive-bindings"
								),
								kv_namespaces: parseJsonMap(
									argv["deployment-configs-production-kv-namespaces"],
									"deployment-configs-production-kv-namespaces"
								),
								limits: {
									cpu_ms: argv["deployment-configs-production-limits-cpu-ms"],
								},
								mtls_certificates: parseJsonMap(
									argv["deployment-configs-production-mtls-certificates"],
									"deployment-configs-production-mtls-certificates"
								),
								placement: {
									mode: resolveFileToken(
										argv["deployment-configs-production-placement-mode"] as
											| string
											| undefined,
										"deployment-configs-production-placement-mode",
										"text"
									),
								},
								queue_producers: parseJsonMap(
									argv["deployment-configs-production-queue-producers"],
									"deployment-configs-production-queue-producers"
								),
								r2_buckets: parseJsonMap(
									argv["deployment-configs-production-r2-buckets"],
									"deployment-configs-production-r2-buckets"
								),
								services: parseJsonMap(
									argv["deployment-configs-production-services"],
									"deployment-configs-production-services"
								),
								usage_model: argv["deployment-configs-production-usage-model"],
								vectorize_bindings: parseJsonMap(
									argv["deployment-configs-production-vectorize-bindings"],
									"deployment-configs-production-vectorize-bindings"
								),
								wrangler_config_hash: resolveFileToken(
									argv["deployment-configs-production-wrangler-config-hash"] as
										| string
										| undefined,
									"deployment-configs-production-wrangler-config-hash",
									"text"
								),
							},
						},
						name: resolveFileToken(
							argv["name"] as string | undefined,
							"name",
							"text"
						),
						production_branch: resolveFileToken(
							argv["production-branch"] as string | undefined,
							"production-branch",
							"text"
						),
						source: {
							config: {
								deployments_enabled: argv["source-config-deployments-enabled"],
								owner: resolveFileToken(
									argv["source-config-owner"] as string | undefined,
									"source-config-owner",
									"text"
								),
								owner_id: resolveFileToken(
									argv["source-config-owner-id"] as string | undefined,
									"source-config-owner-id",
									"text"
								),
								path_excludes: argv["source-config-path-excludes"],
								path_includes: argv["source-config-path-includes"],
								pr_comments_enabled: argv["source-config-pr-comments-enabled"],
								preview_branch_excludes:
									argv["source-config-preview-branch-excludes"],
								preview_branch_includes:
									argv["source-config-preview-branch-includes"],
								preview_deployment_setting:
									argv["source-config-preview-deployment-setting"],
								production_branch: resolveFileToken(
									argv["source-config-production-branch"] as string | undefined,
									"source-config-production-branch",
									"text"
								),
								production_deployments_enabled:
									argv["source-config-production-deployments-enabled"],
								repo_id: resolveFileToken(
									argv["source-config-repo-id"] as string | undefined,
									"source-config-repo-id",
									"text"
								),
								repo_name: resolveFileToken(
									argv["source-config-repo-name"] as string | undefined,
									"source-config-repo-name",
									"text"
								),
							},
							type: argv["source-type"],
						},
					},
					[
						["deployment_configs", "preview", "ai_bindings"],
						["deployment_configs", "preview", "analytics_engine_datasets"],
						["deployment_configs", "preview", "browsers"],
						["deployment_configs", "preview", "d1_databases"],
						["deployment_configs", "preview", "durable_object_namespaces"],
						["deployment_configs", "preview", "env_vars"],
						["deployment_configs", "preview", "hyperdrive_bindings"],
						["deployment_configs", "preview", "kv_namespaces"],
						["deployment_configs", "preview", "mtls_certificates"],
						["deployment_configs", "preview", "queue_producers"],
						["deployment_configs", "preview", "r2_buckets"],
						["deployment_configs", "preview", "services"],
						["deployment_configs", "preview", "vectorize_bindings"],
						["deployment_configs", "production", "ai_bindings"],
						["deployment_configs", "production", "analytics_engine_datasets"],
						["deployment_configs", "production", "browsers"],
						["deployment_configs", "production", "d1_databases"],
						["deployment_configs", "production", "durable_object_namespaces"],
						["deployment_configs", "production", "env_vars"],
						["deployment_configs", "production", "hyperdrive_bindings"],
						["deployment_configs", "production", "kv_namespaces"],
						["deployment_configs", "production", "mtls_certificates"],
						["deployment_configs", "production", "queue_producers"],
						["deployment_configs", "production", "r2_buckets"],
						["deployment_configs", "production", "services"],
						["deployment_configs", "production", "vectorize_bindings"],
					]
				);
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						project_name: argv["project-name"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
