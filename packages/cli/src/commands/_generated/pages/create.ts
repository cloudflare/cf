import operation from "../_operations/pages/create.js";
/**
 * create command
 * @generated from apis/overlays/pages.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create a Cloudflare Pages project",
	usage:
		"$0 pages create\n\nCreate a Cloudflare Pages project for configuring and deploying a site or application.",
	flags: {
		"build-config-build-caching": {
			kind: "boolean",
			brief: "Enable build caching for the project.",
			optional: true,
		},
		"build-config-build-command": {
			kind: "parsed",
			brief: "Command used to build project.",
			optional: true,
			parse: String,
		},
		"build-config-destination-dir": {
			kind: "parsed",
			brief: "Output directory of the build.",
			optional: true,
			parse: String,
		},
		"build-config-root-dir": {
			kind: "parsed",
			brief: "Directory to run the command.",
			optional: true,
			parse: String,
		},
		"build-config-web-analytics-tag": {
			kind: "parsed",
			brief: "The classifying tag for analytics.",
			optional: true,
			parse: String,
		},
		"build-config-web-analytics-token": {
			kind: "parsed",
			brief: "The auth token for analytics.",
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-ai-bindings": {
			kind: "parsed",
			brief:
				'Constellation bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-always-use-latest-compatibility-date": {
			kind: "boolean",
			brief:
				"Whether to always use the latest compatibility date for Pages Functions.",
			optional: true,
		},
		"deployment-configs-preview-analytics-engine-datasets": {
			kind: "parsed",
			brief:
				'Analytics Engine bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-browsers": {
			kind: "parsed",
			brief:
				'Browser bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-build-image-major-version": {
			kind: "parsed",
			brief:
				"The major version of the build image to use for Pages Functions. Version 1 is retired and its projects are moved to version 3. Once a project's builds have been moved, a request that sets version 1 is rejected.",
			optional: true,
			parse: Number,
		},
		"deployment-configs-preview-compatibility-date": {
			kind: "parsed",
			brief: "Compatibility date used for Pages Functions.",
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-compatibility-flags": {
			kind: "parsed",
			brief: "Compatibility flags used for Pages Functions.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-d1-databases": {
			kind: "parsed",
			brief:
				'D1 databases used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-durable-object-namespaces": {
			kind: "parsed",
			brief:
				'Durable Object namespaces used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-env-vars": {
			kind: "parsed",
			brief:
				'Environment variables used for builds and Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-fail-open": {
			kind: "boolean",
			brief:
				"Whether to fail open when the deployment config cannot be applied.",
			optional: true,
		},
		"deployment-configs-preview-hyperdrive-bindings": {
			kind: "parsed",
			brief:
				'Hyperdrive bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-kv-namespaces": {
			kind: "parsed",
			brief:
				'KV namespaces used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-limits-cpu-ms": {
			kind: "parsed",
			brief: "CPU time limit in milliseconds.",
			optional: true,
			parse: Number,
		},
		"deployment-configs-preview-mtls-certificates": {
			kind: "parsed",
			brief:
				'mTLS bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-placement-mode": {
			kind: "parsed",
			brief: "Placement mode.",
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-queue-producers": {
			kind: "parsed",
			brief:
				'Queue Producer bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-r2-buckets": {
			kind: "parsed",
			brief:
				'R2 buckets used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-services": {
			kind: "parsed",
			brief:
				'Services used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-usage-model": {
			kind: "parsed",
			brief: "The usage model for Pages Functions.",
			optional: true,
			choices: ["standard", "bundled", "unbound"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"deployment-configs-preview-usage-model",
					"text"
				),
		},
		"deployment-configs-preview-vectorize-bindings": {
			kind: "parsed",
			brief:
				'Vectorize bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-wrangler-config-hash": {
			kind: "parsed",
			brief: "Hash of the Wrangler configuration used for the deployment.",
			optional: true,
			parse: String,
		},
		"deployment-configs-production-ai-bindings": {
			kind: "parsed",
			brief:
				'Constellation bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-always-use-latest-compatibility-date": {
			kind: "boolean",
			brief:
				"Whether to always use the latest compatibility date for Pages Functions.",
			optional: true,
		},
		"deployment-configs-production-analytics-engine-datasets": {
			kind: "parsed",
			brief:
				'Analytics Engine bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-browsers": {
			kind: "parsed",
			brief:
				'Browser bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-build-image-major-version": {
			kind: "parsed",
			brief:
				"The major version of the build image to use for Pages Functions. Version 1 is retired and its projects are moved to version 3. Once a project's builds have been moved, a request that sets version 1 is rejected.",
			optional: true,
			parse: Number,
		},
		"deployment-configs-production-compatibility-date": {
			kind: "parsed",
			brief: "Compatibility date used for Pages Functions.",
			optional: true,
			parse: String,
		},
		"deployment-configs-production-compatibility-flags": {
			kind: "parsed",
			brief: "Compatibility flags used for Pages Functions.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"deployment-configs-production-d1-databases": {
			kind: "parsed",
			brief:
				'D1 databases used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-durable-object-namespaces": {
			kind: "parsed",
			brief:
				'Durable Object namespaces used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-env-vars": {
			kind: "parsed",
			brief:
				'Environment variables used for builds and Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-fail-open": {
			kind: "boolean",
			brief:
				"Whether to fail open when the deployment config cannot be applied.",
			optional: true,
		},
		"deployment-configs-production-hyperdrive-bindings": {
			kind: "parsed",
			brief:
				'Hyperdrive bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-kv-namespaces": {
			kind: "parsed",
			brief:
				'KV namespaces used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-limits-cpu-ms": {
			kind: "parsed",
			brief: "CPU time limit in milliseconds.",
			optional: true,
			parse: Number,
		},
		"deployment-configs-production-mtls-certificates": {
			kind: "parsed",
			brief:
				'mTLS bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-placement-mode": {
			kind: "parsed",
			brief: "Placement mode.",
			optional: true,
			parse: String,
		},
		"deployment-configs-production-queue-producers": {
			kind: "parsed",
			brief:
				'Queue Producer bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-r2-buckets": {
			kind: "parsed",
			brief:
				'R2 buckets used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-services": {
			kind: "parsed",
			brief:
				'Services used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-usage-model": {
			kind: "parsed",
			brief: "The usage model for Pages Functions.",
			optional: true,
			choices: ["standard", "bundled", "unbound"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"deployment-configs-production-usage-model",
					"text"
				),
		},
		"deployment-configs-production-vectorize-bindings": {
			kind: "parsed",
			brief:
				'Vectorize bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-wrangler-config-hash": {
			kind: "parsed",
			brief: "Hash of the Wrangler configuration used for the deployment.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief:
				"Name for the Pages project. Must begin with a lowercase letter or digit and contain only lowercase letters, digits, and hyphens.",
			optional: true,
			parse: String,
		},
		"production-branch": {
			kind: "parsed",
			brief:
				"Production branch of the project. Used to identify production deployments.",
			optional: true,
			parse: String,
		},
		"source-config-deployments-enabled": {
			kind: "boolean",
			brief:
				"Whether to enable automatic deployments when pushing to the source repository.\nWhen disabled, no deployments (production or preview) will be triggered automatically.\n",
			optional: true,
		},
		"source-config-owner": {
			kind: "parsed",
			brief: "The owner of the repository.",
			optional: true,
			parse: String,
		},
		"source-config-owner-id": {
			kind: "parsed",
			brief: "The owner ID of the repository.",
			optional: true,
			parse: String,
		},
		"source-config-path-excludes": {
			kind: "parsed",
			brief:
				"A list of paths that should be excluded from triggering a preview deployment. Wildcard syntax (`*`) is supported.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"source-config-path-includes": {
			kind: "parsed",
			brief:
				"A list of paths that should be watched to trigger a preview deployment. Wildcard syntax (`*`) is supported.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"source-config-pr-comments-enabled": {
			kind: "boolean",
			brief: "Whether to enable PR comments.",
			optional: true,
		},
		"source-config-preview-branch-excludes": {
			kind: "parsed",
			brief:
				"A list of branches that should not trigger a preview deployment. Wildcard syntax (`*`) is supported. Must be used with `preview_deployment_setting` set to `custom`.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"source-config-preview-branch-includes": {
			kind: "parsed",
			brief:
				"A list of branches that should trigger a preview deployment. Wildcard syntax (`*`) is supported. Must be used with `preview_deployment_setting` set to `custom`.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"source-config-preview-deployment-setting": {
			kind: "parsed",
			brief:
				"Controls whether commits to preview branches trigger a preview deployment.",
			optional: true,
			choices: ["all", "none", "custom"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"source-config-preview-deployment-setting",
					"text"
				),
		},
		"source-config-production-branch": {
			kind: "parsed",
			brief: "The production branch of the repository.",
			optional: true,
			parse: String,
		},
		"source-config-production-deployments-enabled": {
			kind: "boolean",
			brief:
				"Whether to trigger a production deployment on commits to the production branch.",
			optional: true,
		},
		"source-config-repo-id": {
			kind: "parsed",
			brief: "The ID of the repository.",
			optional: true,
			parse: String,
		},
		"source-config-repo-name": {
			kind: "parsed",
			brief: "The name of the repository.",
			optional: true,
			parse: String,
		},
		"source-type": {
			kind: "parsed",
			brief: "The source control management provider.",
			optional: true,
			choices: ["github", "gitlab"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "source-type", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	rules(rules) {
		rules.check((argv) => {
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
			if (!argv.body && groupSet) {
				const missing = ["source-type"].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --source-* flag is set`
					);
				}
			}
			return true;
		});
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "pages create",
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
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"Name for the Pages project. Must begin with a lowercase letter or digit and contain only lowercase letters, digits, and hyphens."
						);
					}
					if (argv["production-branch"] === undefined) {
						argv["production-branch"] = await promptForRequiredField(
							"production-branch",
							"Production branch of the project. Used to identify production deployments."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf pages create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pages/projects`,
						pathParams: {},
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
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

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
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
