import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/builds.ts
 */
import type { Argv, CommandModule } from "yargs";
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 builds workers create\n\nConnect a Worker tag to a repository and production build settings."
		)
		.option("git-repository-branch", {
			type: "string",
			description: "Git branch to watch for builds",
		})
		.option("git-repository-provider-account-id", {
			type: "string",
			description:
				"Provider-specific identifier of the account or namespace that owns the repository.",
		})
		.option("git-repository-provider-account-name", {
			type: "string",
			description:
				"Human-readable name of the account or namespace that owns the repository.",
		})
		.option("git-repository-provider-type", {
			type: "string",
			description: "The git_repository.provider_type field",
			choices: ["github", "gitlab", "gitlab_internal", "origin"],
		})
		.option("git-repository-repo-id", {
			type: "string",
			description: "Provider-specific repository identifier.",
		})
		.option("git-repository-repo-name", {
			type: "string",
			description: "Human-readable repository name.",
		})
		.option("git-repository-grant-id", {
			type: "string",
			description: "Grant ID required for grant-backed providers",
		})
		.option("previews-base-config-build-caching-enabled", {
			type: "boolean",
			description:
				"Whether builds reuse cached dependencies and build artifacts.",
			default: true,
		})
		.option("previews-base-config-build-command", {
			type: "string",
			description: "Command to build the Worker.",
		})
		.option("previews-base-config-build-token-uuid", {
			type: "string",
			description: "UUID of the build token used when deploying the Worker.",
		})
		.option("previews-base-config-deploy-command", {
			type: "string",
			description: "Command to deploy the Worker.",
		})
		.option("previews-base-config-path-excludes", {
			type: "string",
			array: true,
			description: "Path patterns that must not start builds.",
		})
		.option("previews-base-config-path-includes", {
			type: "string",
			array: true,
			description: "Path patterns that can start builds.",
		})
		.option("previews-base-config-root-directory", {
			type: "string",
			description:
				"Repository directory in which build and deploy commands run.",
			default: "/",
		})
		.option("previews-enabled", {
			type: "boolean",
			description: "Whether Previews are enabled for this Worker",
		})
		.option("production-settings-build-caching-enabled", {
			type: "boolean",
			description:
				"Whether builds reuse cached dependencies and build artifacts.",
			default: true,
		})
		.option("production-settings-build-command", {
			type: "string",
			description: "Command to build the Worker.",
		})
		.option("production-settings-build-token-uuid", {
			type: "string",
			description: "UUID of the build token used when deploying the Worker.",
		})
		.option("production-settings-deploy-command", {
			type: "string",
			description: "Command to deploy the Worker.",
		})
		.option("production-settings-path-excludes", {
			type: "string",
			array: true,
			description: "Path patterns that must not start builds.",
		})
		.option("production-settings-path-includes", {
			type: "string",
			array: true,
			description: "Path patterns that can start builds.",
		})
		.option("production-settings-root-directory", {
			type: "string",
			description:
				"Repository directory in which build and deploy commands run.",
			default: "/",
		})
		.option("script-tag", {
			type: "string",
			description:
				"System-generated tag of the Worker. This is not the Worker name.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Request body for creating a Worker build configuration.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"createWorkerBuild">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Worker build configuration",
	builder,
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf builds workers create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/workers`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
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
											provider_type: resolveFileToken(
												argv["git-repository-provider-type"] as
													| string
													| undefined,
												"git-repository-provider-type",
												"text"
											),
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
										script_tag: resolveFileToken(
											argv["script-tag"] as string | undefined,
											"script-tag",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.builds.workers.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
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
				if (argv["script-tag"] === undefined) {
					argv["script-tag"] = await promptForRequiredField(
						"script-tag",
						"System-generated tag of the Worker. This is not the Worker name."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
						provider_type: resolveFileToken(
							argv["git-repository-provider-type"] as string | undefined,
							"git-repository-provider-type",
							"text"
						),
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
						path_excludes: argv["production-settings-path-excludes"],
						path_includes: argv["production-settings-path-includes"],
						root_directory: resolveFileToken(
							argv["production-settings-root-directory"] as string | undefined,
							"production-settings-root-directory",
							"text"
						),
					},
					script_tag: resolveFileToken(
						argv["script-tag"] as string | undefined,
						"script-tag",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.builds.workers.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
