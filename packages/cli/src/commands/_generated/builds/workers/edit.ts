/**
 * edit command
 * @generated from apis/overlays/builds.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseJsonMap,
	setNestedValue,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit <worker>",
	describe: "Update Worker build configuration",
	usage:
		"$0 builds workers edit <worker>\n\nUpdate the build configuration for a Worker script. Supports partial updates to git repository settings, production build settings, and Preview settings.",
	flags: {
		"patch-existing-previews": {
			kind: "enum",
			brief:
				"Apply a previews_base_config patch to every existing Preview of the Worker as well as to the base config.",
			values: ["true", "false"],
			optional: true,
		},
		"git-repository-branch": {
			kind: "parsed",
			brief: "New git branch to watch for builds",
			optional: true,
			parse: String,
		},
		"previews-base-config-build-caching-enabled": {
			kind: "boolean",
			brief: "Whether builds reuse cached dependencies and build artifacts.",
			optional: true,
		},
		"previews-base-config-build-command": {
			kind: "parsed",
			brief: "Command to build the Worker.",
			optional: true,
			parse: String,
		},
		"previews-base-config-build-token-uuid": {
			kind: "parsed",
			brief: "UUID of the build token used when deploying the Worker.",
			optional: true,
			parse: String,
		},
		"previews-base-config-deploy-command": {
			kind: "parsed",
			brief: "Command to deploy the Worker.",
			optional: true,
			parse: String,
		},
		"previews-base-config-environment-variables": {
			kind: "parsed",
			brief:
				'Environment variable updates. Set the variable entry to null to delete it. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"previews-base-config-path-excludes": {
			kind: "parsed",
			brief: "Path patterns that must not start builds.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"previews-base-config-path-includes": {
			kind: "parsed",
			brief: "Path patterns that can start builds.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"previews-base-config-root-directory": {
			kind: "parsed",
			brief: "Repository directory in which build and deploy commands run.",
			optional: true,
			parse: String,
		},
		"previews-enabled": {
			kind: "boolean",
			brief:
				"Enable or disable Previews for this Worker. Enabling requires previews_base_config to already exist or to be sent in the same request.",
			optional: true,
		},
		"production-settings-build-caching-enabled": {
			kind: "boolean",
			brief: "Whether builds reuse cached dependencies and build artifacts.",
			optional: true,
		},
		"production-settings-build-command": {
			kind: "parsed",
			brief: "Command to build the Worker.",
			optional: true,
			parse: String,
		},
		"production-settings-build-token-uuid": {
			kind: "parsed",
			brief: "UUID of the build token used when deploying the Worker.",
			optional: true,
			parse: String,
		},
		"production-settings-deploy-command": {
			kind: "parsed",
			brief: "Command to deploy the Worker.",
			optional: true,
			parse: String,
		},
		"production-settings-environment-variables": {
			kind: "parsed",
			brief:
				'Environment variable updates. Set the variable entry to null to delete it. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"production-settings-path-excludes": {
			kind: "parsed",
			brief: "Path patterns that must not start builds.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"production-settings-path-includes": {
			kind: "parsed",
			brief: "Path patterns that can start builds.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"production-settings-root-directory": {
			kind: "parsed",
			brief: "Repository directory in which build and deploy commands run.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Request body for updating a Worker build configuration. At least one field must be provided.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "worker",
			brief: "Script tag of the Worker.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "builds workers edit",
				classification: {
					safeFlags: [
						"patch-existing-previews",
						"previews-base-config-build-caching-enabled",
						"previews-enabled",
						"production-settings-build-caching-enabled",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					patch_existing_previews: argv["patch-existing-previews"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf builds workers edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/workers/${argv["worker"] == null ? "<worker>" : encodeURIComponent(String(argv["worker"]))}`,
						pathParams: { worker: String(argv["worker"] ?? "") },
						query: queryParams,
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											git_repository: {
												branch: resolveFileToken(
													argv["git-repository-branch"] as string | undefined,
													"git-repository-branch",
													"text"
												),
											},
											previews_base_config: {
												build_caching_enabled:
													argv["previews-base-config-build-caching-enabled"],
												build_command: resolveFileToken(
													argv["previews-base-config-build-command"] as
														| string
														| undefined,
													"previews-base-config-build-command",
													"text"
												),
												build_token_uuid: resolveFileToken(
													argv["previews-base-config-build-token-uuid"] as
														| string
														| undefined,
													"previews-base-config-build-token-uuid",
													"text"
												),
												deploy_command: resolveFileToken(
													argv["previews-base-config-deploy-command"] as
														| string
														| undefined,
													"previews-base-config-deploy-command",
													"text"
												),
												environment_variables: parseJsonMap(
													argv["previews-base-config-environment-variables"],
													"previews-base-config-environment-variables"
												),
												path_excludes:
													argv["previews-base-config-path-excludes"],
												path_includes:
													argv["previews-base-config-path-includes"],
												root_directory: resolveFileToken(
													argv["previews-base-config-root-directory"] as
														| string
														| undefined,
													"previews-base-config-root-directory",
													"text"
												),
											},
											previews_enabled: argv["previews-enabled"],
											production_settings: {
												build_caching_enabled:
													argv["production-settings-build-caching-enabled"],
												build_command: resolveFileToken(
													argv["production-settings-build-command"] as
														| string
														| undefined,
													"production-settings-build-command",
													"text"
												),
												build_token_uuid: resolveFileToken(
													argv["production-settings-build-token-uuid"] as
														| string
														| undefined,
													"production-settings-build-token-uuid",
													"text"
												),
												deploy_command: resolveFileToken(
													argv["production-settings-deploy-command"] as
														| string
														| undefined,
													"production-settings-deploy-command",
													"text"
												),
												environment_variables: parseJsonMap(
													argv["production-settings-environment-variables"],
													"production-settings-environment-variables"
												),
												path_excludes:
													argv["production-settings-path-excludes"],
												path_includes:
													argv["production-settings-path-includes"],
												root_directory: resolveFileToken(
													argv["production-settings-root-directory"] as
														| string
														| undefined,
													"production-settings-root-directory",
													"text"
												),
											},
										},
										[
											["previews_base_config", "environment_variables"],
											["production_settings", "environment_variables"],
										]
									),
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
					const qs = new URLSearchParams(
						Object.entries(queryParams)
							.filter(([, v]) => v !== undefined)
							.map(([k, v]) => [k, String(v)])
					).toString();
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PATCH",
							`/accounts/${accountId}/builds/workers/${encodeURIComponent(String(argv["worker"]))}${qs ? "?" + qs : ""}`,
							{ body: bodyData }
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["git-repository-branch"] !== undefined)
					setNestedValue(
						bodyData,
						["git_repository", "branch"],
						resolveFileToken(
							argv["git-repository-branch"] as string | undefined,
							"git-repository-branch",
							"text"
						)
					);
				if (argv["previews-base-config-build-caching-enabled"] !== undefined)
					setNestedValue(
						bodyData,
						["previews_base_config", "build_caching_enabled"],
						argv["previews-base-config-build-caching-enabled"]
					);
				if (argv["previews-base-config-build-command"] !== undefined)
					setNestedValue(
						bodyData,
						["previews_base_config", "build_command"],
						resolveFileToken(
							argv["previews-base-config-build-command"] as string | undefined,
							"previews-base-config-build-command",
							"text"
						)
					);
				if (argv["previews-base-config-build-token-uuid"] !== undefined)
					setNestedValue(
						bodyData,
						["previews_base_config", "build_token_uuid"],
						resolveFileToken(
							argv["previews-base-config-build-token-uuid"] as
								| string
								| undefined,
							"previews-base-config-build-token-uuid",
							"text"
						)
					);
				if (argv["previews-base-config-deploy-command"] !== undefined)
					setNestedValue(
						bodyData,
						["previews_base_config", "deploy_command"],
						resolveFileToken(
							argv["previews-base-config-deploy-command"] as string | undefined,
							"previews-base-config-deploy-command",
							"text"
						)
					);
				if (argv["previews-base-config-environment-variables"] !== undefined)
					setNestedValue(
						bodyData,
						["previews_base_config", "environment_variables"],
						parseJsonMap(
							argv["previews-base-config-environment-variables"],
							"previews-base-config-environment-variables"
						)
					);
				if (argv["previews-base-config-path-excludes"] !== undefined)
					setNestedValue(
						bodyData,
						["previews_base_config", "path_excludes"],
						argv["previews-base-config-path-excludes"]
					);
				if (argv["previews-base-config-path-includes"] !== undefined)
					setNestedValue(
						bodyData,
						["previews_base_config", "path_includes"],
						argv["previews-base-config-path-includes"]
					);
				if (argv["previews-base-config-root-directory"] !== undefined)
					setNestedValue(
						bodyData,
						["previews_base_config", "root_directory"],
						resolveFileToken(
							argv["previews-base-config-root-directory"] as string | undefined,
							"previews-base-config-root-directory",
							"text"
						)
					);
				if (argv["previews-enabled"] !== undefined)
					setNestedValue(
						bodyData,
						["previews_enabled"],
						argv["previews-enabled"]
					);
				if (argv["production-settings-build-caching-enabled"] !== undefined)
					setNestedValue(
						bodyData,
						["production_settings", "build_caching_enabled"],
						argv["production-settings-build-caching-enabled"]
					);
				if (argv["production-settings-build-command"] !== undefined)
					setNestedValue(
						bodyData,
						["production_settings", "build_command"],
						resolveFileToken(
							argv["production-settings-build-command"] as string | undefined,
							"production-settings-build-command",
							"text"
						)
					);
				if (argv["production-settings-build-token-uuid"] !== undefined)
					setNestedValue(
						bodyData,
						["production_settings", "build_token_uuid"],
						resolveFileToken(
							argv["production-settings-build-token-uuid"] as
								| string
								| undefined,
							"production-settings-build-token-uuid",
							"text"
						)
					);
				if (argv["production-settings-deploy-command"] !== undefined)
					setNestedValue(
						bodyData,
						["production_settings", "deploy_command"],
						resolveFileToken(
							argv["production-settings-deploy-command"] as string | undefined,
							"production-settings-deploy-command",
							"text"
						)
					);
				if (argv["production-settings-environment-variables"] !== undefined)
					setNestedValue(
						bodyData,
						["production_settings", "environment_variables"],
						parseJsonMap(
							argv["production-settings-environment-variables"],
							"production-settings-environment-variables"
						)
					);
				if (argv["production-settings-path-excludes"] !== undefined)
					setNestedValue(
						bodyData,
						["production_settings", "path_excludes"],
						argv["production-settings-path-excludes"]
					);
				if (argv["production-settings-path-includes"] !== undefined)
					setNestedValue(
						bodyData,
						["production_settings", "path_includes"],
						argv["production-settings-path-includes"]
					);
				if (argv["production-settings-root-directory"] !== undefined)
					setNestedValue(
						bodyData,
						["production_settings", "root_directory"],
						resolveFileToken(
							argv["production-settings-root-directory"] as string | undefined,
							"production-settings-root-directory",
							"text"
						)
					);
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PATCH",
						`/accounts/${accountId}/builds/workers/${encodeURIComponent(String(argv["worker"]))}${qs ? "?" + qs : ""}`,
						{ body: bodyData }
					)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
