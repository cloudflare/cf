import operation from "../../_operations/builds/workers/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
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
													argv["git-repository-repo-id"] as string | undefined,
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
							argv["git-repository-provider-account-id"] as string | undefined,
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
							argv["previews-base-config-build-command"] as string | undefined,
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
							argv["previews-base-config-deploy-command"] as string | undefined,
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
							argv["previews-base-config-root-directory"] as string | undefined,
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
							argv["production-settings-deploy-command"] as string | undefined,
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
							argv["production-settings-root-directory"] as string | undefined,
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
	);
}
