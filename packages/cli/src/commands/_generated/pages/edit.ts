import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/pages.ts
 */
import type { Argv, CommandModule } from "yargs";

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
		.option("deployment-configs-preview-always-use-latest-compatibility-date", {
			type: "boolean",
			description:
				"Whether to always use the latest compatibility date for Pages Functions.",
		})
		.option("deployment-configs-preview-build-image-major-version", {
			type: "number",
			description:
				"The major version of the build image to use for Pages Functions.",
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
		.option("deployment-configs-preview-fail-open", {
			type: "boolean",
			description:
				"Whether to fail open when the deployment config cannot be applied.",
		})
		.option("deployment-configs-preview-limits-cpu-ms", {
			type: "number",
			description: "CPU time limit in milliseconds.",
		})
		.option("deployment-configs-preview-placement-mode", {
			type: "string",
			description: "Placement mode.",
		})
		.option("deployment-configs-preview-usage-model", {
			type: "string",
			description: "The usage model for Pages Functions.",
			choices: ["standard", "bundled", "unbound"],
		})
		.option("deployment-configs-preview-wrangler-config-hash", {
			type: "string",
			description:
				"Hash of the Wrangler configuration used for the deployment.",
		})
		.option(
			"deployment-configs-production-always-use-latest-compatibility-date",
			{
				type: "boolean",
				description:
					"Whether to always use the latest compatibility date for Pages Functions.",
			}
		)
		.option("deployment-configs-production-build-image-major-version", {
			type: "number",
			description:
				"The major version of the build image to use for Pages Functions.",
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
		.option("deployment-configs-production-fail-open", {
			type: "boolean",
			description:
				"Whether to fail open when the deployment config cannot be applied.",
		})
		.option("deployment-configs-production-limits-cpu-ms", {
			type: "number",
			description: "CPU time limit in milliseconds.",
		})
		.option("deployment-configs-production-placement-mode", {
			type: "string",
			description: "Placement mode.",
		})
		.option("deployment-configs-production-usage-model", {
			type: "string",
			description: "The usage model for Pages Functions.",
			choices: ["standard", "bundled", "unbound"],
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
				"deployment-configs-preview-always-use-latest-compatibility-date",
				"deployment-configs-preview-build-image-major-version",
				"deployment-configs-preview-compatibility-date",
				"deployment-configs-preview-compatibility-flags",
				"deployment-configs-preview-fail-open",
				"deployment-configs-preview-limits-cpu-ms",
				"deployment-configs-preview-placement-mode",
				"deployment-configs-preview-usage-model",
				"deployment-configs-preview-wrangler-config-hash",
				"deployment-configs-production-always-use-latest-compatibility-date",
				"deployment-configs-production-build-image-major-version",
				"deployment-configs-production-compatibility-date",
				"deployment-configs-production-compatibility-flags",
				"deployment-configs-production-fail-open",
				"deployment-configs-production-limits-cpu-ms",
				"deployment-configs-production-placement-mode",
				"deployment-configs-production-usage-model",
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

type Request = SdkRequest<"pages-project-update-project">;
type Body = Request;

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
					formatDryRun(
						{
							command: "cf pages edit",
							method: "PATCH",
							url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pages/projects/${argv["project-name"] == null ? "<project-name>" : encodeURIComponent(String(argv["project-name"]))}`,
							pathParams: {
								"project-name": String(argv["project-name"] ?? ""),
							},
							bodyKind: "json",
							body:
								argv.body !== undefined
									? parseBody(argv.body)
									: compactBody({
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
													always_use_latest_compatibility_date:
														argv[
															"deployment-configs-preview-always-use-latest-compatibility-date"
														],
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
													fail_open:
														argv["deployment-configs-preview-fail-open"],
													limits: {
														cpu_ms:
															argv["deployment-configs-preview-limits-cpu-ms"],
													},
													placement: {
														mode: resolveFileToken(
															argv[
																"deployment-configs-preview-placement-mode"
															] as string | undefined,
															"deployment-configs-preview-placement-mode",
															"text"
														),
													},
													usage_model: resolveFileToken(
														argv["deployment-configs-preview-usage-model"] as
															| string
															| undefined,
														"deployment-configs-preview-usage-model",
														"text"
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
													always_use_latest_compatibility_date:
														argv[
															"deployment-configs-production-always-use-latest-compatibility-date"
														],
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
													fail_open:
														argv["deployment-configs-production-fail-open"],
													limits: {
														cpu_ms:
															argv[
																"deployment-configs-production-limits-cpu-ms"
															],
													},
													placement: {
														mode: resolveFileToken(
															argv[
																"deployment-configs-production-placement-mode"
															] as string | undefined,
															"deployment-configs-production-placement-mode",
															"text"
														),
													},
													usage_model: resolveFileToken(
														argv["deployment-configs-production-usage-model"] as
															| string
															| undefined,
														"deployment-configs-production-usage-model",
														"text"
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
													preview_deployment_setting: resolveFileToken(
														argv["source-config-preview-deployment-setting"] as
															| string
															| undefined,
														"source-config-preview-deployment-setting",
														"text"
													),
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
												type: resolveFileToken(
													argv["source-type"] as string | undefined,
													"source-type",
													"text"
												),
											},
										}),
						},
						{ sensitiveBodyPaths: [["build_config", "web_analytics_token"]] }
					);
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.pages.edit({
							...bodyData,
							account_id: accountId,
							project_name: argv["project-name"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
							always_use_latest_compatibility_date:
								argv[
									"deployment-configs-preview-always-use-latest-compatibility-date"
								],
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
							fail_open: argv["deployment-configs-preview-fail-open"],
							limits: {
								cpu_ms: argv["deployment-configs-preview-limits-cpu-ms"],
							},
							placement: {
								mode: resolveFileToken(
									argv["deployment-configs-preview-placement-mode"] as
										| string
										| undefined,
									"deployment-configs-preview-placement-mode",
									"text"
								),
							},
							usage_model: resolveFileToken(
								argv["deployment-configs-preview-usage-model"] as
									| string
									| undefined,
								"deployment-configs-preview-usage-model",
								"text"
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
							always_use_latest_compatibility_date:
								argv[
									"deployment-configs-production-always-use-latest-compatibility-date"
								],
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
							fail_open: argv["deployment-configs-production-fail-open"],
							limits: {
								cpu_ms: argv["deployment-configs-production-limits-cpu-ms"],
							},
							placement: {
								mode: resolveFileToken(
									argv["deployment-configs-production-placement-mode"] as
										| string
										| undefined,
									"deployment-configs-production-placement-mode",
									"text"
								),
							},
							usage_model: resolveFileToken(
								argv["deployment-configs-production-usage-model"] as
									| string
									| undefined,
								"deployment-configs-production-usage-model",
								"text"
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
							preview_deployment_setting: resolveFileToken(
								argv["source-config-preview-deployment-setting"] as
									| string
									| undefined,
								"source-config-preview-deployment-setting",
								"text"
							),
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
						type: resolveFileToken(
							argv["source-type"] as string | undefined,
							"source-type",
							"text"
						),
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.pages.edit({
						...bodyData,
						account_id: accountId,
						project_name: argv["project-name"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
