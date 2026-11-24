import operation from "../_operations/pages/edit.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./edit.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
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
			} satisfies ArgClassification<typeof argv>,
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
												fail_open: argv["deployment-configs-preview-fail-open"],
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
													argv["deployment-configs-preview-mtls-certificates"],
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
													argv["deployment-configs-preview-vectorize-bindings"],
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
														argv["deployment-configs-production-limits-cpu-ms"],
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
													argv["source-config-owner-id"] as string | undefined,
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
										["deployment_configs", "production", "hyperdrive_bindings"],
										["deployment_configs", "production", "kv_namespaces"],
										["deployment_configs", "production", "mtls_certificates"],
										["deployment_configs", "production", "queue_producers"],
										["deployment_configs", "production", "r2_buckets"],
										["deployment_configs", "production", "services"],
										["deployment_configs", "production", "vectorize_bindings"],
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
								argv["deployment-configs-production-analytics-engine-datasets"],
								"deployment-configs-production-analytics-engine-datasets"
							),
							browsers: parseJsonMap(
								argv["deployment-configs-production-browsers"],
								"deployment-configs-production-browsers"
							),
							build_image_major_version:
								argv["deployment-configs-production-build-image-major-version"],
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
								argv["deployment-configs-production-durable-object-namespaces"],
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
	);
}
