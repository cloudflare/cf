import operation from "../../_operations/builds/workers/create.js";
/**
 * create command
 * @generated from apis/overlays/builds.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	mergeBodyPositionals,
	parseBody,
	parseJsonMap,
} from "#lib/body-parser.js";
import { validateBodyUnions } from "#lib/body-unions.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const bodyUnions: Parameters<typeof validateBodyUnions>[1] = [
	{
		path: ["git_repository"],
		selector: "provider_type",
		variants: [
			{
				values: ["github", "gitlab"],
				schema: {
					type: "object",
					properties: {
						branch: { type: "string" },
						provider_account_id: { type: "string" },
						provider_account_name: { type: "string" },
						provider_type: { enum: ["github", "gitlab"] },
						repo_id: { type: "string" },
						repo_name: { type: "string" },
					},
					required: [
						"branch",
						"provider_account_id",
						"provider_account_name",
						"provider_type",
						"repo_id",
						"repo_name",
					],
					additionalProperties: false,
				},
			},
			{
				values: ["gitlab_internal", "origin"],
				schema: {
					type: "object",
					properties: {
						branch: { type: "string" },
						grant_id: { type: "string" },
						provider_account_id: { type: "string" },
						provider_account_name: { type: "string" },
						provider_type: { enum: ["gitlab_internal", "origin"] },
						repo_id: { type: "string" },
						repo_name: { type: "string" },
					},
					required: [
						"branch",
						"grant_id",
						"provider_account_id",
						"provider_account_name",
						"provider_type",
						"repo_id",
						"repo_name",
					],
					additionalProperties: false,
				},
			},
		],
	},
];

const command = apiCommand({
	command: "create <script-tag>",
	describe: "Create Worker build configuration",
	usage:
		"$0 builds workers create <script-tag>\n\nConnect a Worker tag to a repository and production build settings.",
	flags: {
		"git-repository-branch": {
			kind: "parsed",
			brief: "Git branch to watch for builds",
			optional: true,
			parse: String,
		},
		"git-repository-provider-account-id": {
			kind: "parsed",
			brief:
				"Provider-specific identifier of the account or namespace that owns the repository.",
			optional: true,
			parse: String,
		},
		"git-repository-provider-account-name": {
			kind: "parsed",
			brief:
				"Human-readable name of the account or namespace that owns the repository.",
			optional: true,
			parse: String,
		},
		"git-repository-provider-type": {
			kind: "parsed",
			brief: "The git_repository.provider_type field",
			optional: true,
			choices: ["github", "gitlab", "gitlab_internal", "origin"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "git-repository-provider-type", "text"),
		},
		"git-repository-repo-id": {
			kind: "parsed",
			brief: "Provider-specific repository identifier.",
			optional: true,
			parse: String,
		},
		"git-repository-repo-name": {
			kind: "parsed",
			brief: "Human-readable repository name.",
			optional: true,
			parse: String,
		},
		"git-repository-grant-id": {
			kind: "parsed",
			brief: "Grant ID required for grant-backed providers",
			optional: true,
			parse: String,
		},
		"previews-base-config-build-caching-enabled": {
			kind: "boolean",
			brief: "Whether builds reuse cached dependencies and build artifacts.",
			default: true,
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
				'Map of environment-variable names to build-time values. Names must begin with a letter or underscore and contain only letters, numbers, and underscores. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": {...}}.',
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
			default: "/",
			parse: String,
		},
		"previews-enabled": {
			kind: "boolean",
			brief: "Whether Previews are enabled for this Worker",
			optional: true,
		},
		"production-settings-build-caching-enabled": {
			kind: "boolean",
			brief: "Whether builds reuse cached dependencies and build artifacts.",
			default: true,
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
				'Map of environment-variable names to build-time values. Names must begin with a letter or underscore and contain only letters, numbers, and underscores. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": {...}}.',
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
			default: "/",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Request body for creating a Worker build configuration.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "script-tag",
			brief: "Script tag of the Worker.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "builds workers create",
				classification: {
					safeFlags: [
						"git-repository-provider-type",
						"previews-base-config-build-caching-enabled",
						"previews-enabled",
						"production-settings-build-caching-enabled",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["git-repository-branch"] === undefined) {
						argv["git-repository-branch"] = await promptForRequiredField(
							"git-repository-branch",
							"Git branch to watch for builds"
						);
					}
					if (argv["git-repository-provider-account-id"] === undefined) {
						argv["git-repository-provider-account-id"] =
							await promptForRequiredField(
								"git-repository-provider-account-id",
								"Provider-specific identifier of the account or namespace that owns the repository."
							);
					}
					if (argv["git-repository-provider-account-name"] === undefined) {
						argv["git-repository-provider-account-name"] =
							await promptForRequiredField(
								"git-repository-provider-account-name",
								"Human-readable name of the account or namespace that owns the repository."
							);
					}
					if (argv["git-repository-provider-type"] === undefined) {
						argv["git-repository-provider-type"] =
							await promptForRequiredEnumField(
								"git-repository-provider-type",
								"The git_repository.provider_type field",
								["github", "gitlab", "gitlab_internal", "origin"] as const
							);
					}
					if (argv["git-repository-repo-id"] === undefined) {
						argv["git-repository-repo-id"] = await promptForRequiredField(
							"git-repository-repo-id",
							"Provider-specific repository identifier."
						);
					}
					if (argv["git-repository-repo-name"] === undefined) {
						argv["git-repository-repo-name"] = await promptForRequiredField(
							"git-repository-repo-name",
							"Human-readable repository name."
						);
					}
					if (argv["previews-base-config-build-command"] === undefined) {
						argv["previews-base-config-build-command"] =
							await promptForRequiredField(
								"previews-base-config-build-command",
								"Command to build the Worker."
							);
					}
					if (argv["previews-base-config-build-token-uuid"] === undefined) {
						argv["previews-base-config-build-token-uuid"] =
							await promptForRequiredField(
								"previews-base-config-build-token-uuid",
								"UUID of the build token used when deploying the Worker."
							);
					}
					if (argv["previews-base-config-deploy-command"] === undefined) {
						argv["previews-base-config-deploy-command"] =
							await promptForRequiredField(
								"previews-base-config-deploy-command",
								"Command to deploy the Worker."
							);
					}
					if (argv["previews-enabled"] === undefined) {
						throw new Error(
							"--previews-enabled is required (or pass --body with this field set)."
						);
					}
					if (argv["production-settings-build-command"] === undefined) {
						argv["production-settings-build-command"] =
							await promptForRequiredField(
								"production-settings-build-command",
								"Command to build the Worker."
							);
					}
					if (argv["production-settings-build-token-uuid"] === undefined) {
						argv["production-settings-build-token-uuid"] =
							await promptForRequiredField(
								"production-settings-build-token-uuid",
								"UUID of the build token used when deploying the Worker."
							);
					}
					if (argv["production-settings-deploy-command"] === undefined) {
						argv["production-settings-deploy-command"] =
							await promptForRequiredField(
								"production-settings-deploy-command",
								"Command to deploy the Worker."
							);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf builds workers create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/workers`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? mergeBodyPositionals(parseBody(argv.body), [
										{
											name: "script-tag",
											field: "script_tag",
											value: argv["script-tag"],
										},
									])
								: validateBodyUnions(
										compactBody(
											{
												git_repository: {
													branch: resolveFileToken(
														argv["git-repository-branch"] as string | undefined,
														"git-repository-branch",
														"text"
													),
													provider_account_id: resolveFileToken(
														argv["git-repository-provider-account-id"] as
															| string
															| undefined,
														"git-repository-provider-account-id",
														"text"
													),
													provider_account_name: resolveFileToken(
														argv["git-repository-provider-account-name"] as
															| string
															| undefined,
														"git-repository-provider-account-name",
														"text"
													),
													provider_type: argv["git-repository-provider-type"],
													repo_id: resolveFileToken(
														argv["git-repository-repo-id"] as
															| string
															| undefined,
														"git-repository-repo-id",
														"text"
													),
													repo_name: resolveFileToken(
														argv["git-repository-repo-name"] as
															| string
															| undefined,
														"git-repository-repo-name",
														"text"
													),
													grant_id: resolveFileToken(
														argv["git-repository-grant-id"] as
															| string
															| undefined,
														"git-repository-grant-id",
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
												script_tag: argv["script-tag"],
											},
											[
												["previews_base_config", "environment_variables"],
												["production_settings", "environment_variables"],
											]
										),
										bodyUnions
									),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined
						? mergeBodyPositionals(parseBody(argv.body), [
								{
									name: "script-tag",
									field: "script_tag",
									value: argv["script-tag"],
								},
							])
						: undefined;
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
						git_repository: {
							branch: resolveFileToken(
								argv["git-repository-branch"] as string | undefined,
								"git-repository-branch",
								"text"
							),
							provider_account_id: resolveFileToken(
								argv["git-repository-provider-account-id"] as
									| string
									| undefined,
								"git-repository-provider-account-id",
								"text"
							),
							provider_account_name: resolveFileToken(
								argv["git-repository-provider-account-name"] as
									| string
									| undefined,
								"git-repository-provider-account-name",
								"text"
							),
							provider_type: argv["git-repository-provider-type"],
							repo_id: resolveFileToken(
								argv["git-repository-repo-id"] as string | undefined,
								"git-repository-repo-id",
								"text"
							),
							repo_name: resolveFileToken(
								argv["git-repository-repo-name"] as string | undefined,
								"git-repository-repo-name",
								"text"
							),
							grant_id: resolveFileToken(
								argv["git-repository-grant-id"] as string | undefined,
								"git-repository-grant-id",
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
							path_excludes: argv["previews-base-config-path-excludes"],
							path_includes: argv["previews-base-config-path-includes"],
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
								argv["production-settings-build-command"] as string | undefined,
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
							path_excludes: argv["production-settings-path-excludes"],
							path_includes: argv["production-settings-path-includes"],
							root_directory: resolveFileToken(
								argv["production-settings-root-directory"] as
									| string
									| undefined,
								"production-settings-root-directory",
								"text"
							),
						},
						script_tag: argv["script-tag"],
					},
					[
						["previews_base_config", "environment_variables"],
						["production_settings", "environment_variables"],
					]
				);
				validateBodyUnions(bodyData, bodyUnions);
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
