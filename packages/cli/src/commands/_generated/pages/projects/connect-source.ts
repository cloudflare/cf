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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * connect-source command
 * @generated from apis/overlays/pages.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 pages projects connect-source <project-name>\n\nConnect a Git repository source to an existing Pages project."
		)
		.positional("project-name", {
			type: "string",
			description: "Name of the project.",
			demandOption: true,
		})
		.option("config-deployments-enabled", {
			type: "boolean",
			description:
				"Whether to enable automatic deployments when pushing to the source repository.\nWhen disabled, no deployments (production or preview) will be triggered automatically.\n",
		})
		.option("config-owner", {
			type: "string",
			description: "The owner of the repository.",
		})
		.option("config-owner-id", {
			type: "string",
			description: "The owner ID of the repository.",
		})
		.option("config-path-excludes", {
			type: "string",
			array: true,
			description:
				"A list of paths that should be excluded from triggering a preview deployment. Wildcard syntax (`*`) is supported.",
		})
		.option("config-path-includes", {
			type: "string",
			array: true,
			description:
				"A list of paths that should be watched to trigger a preview deployment. Wildcard syntax (`*`) is supported.",
		})
		.option("config-pr-comments-enabled", {
			type: "boolean",
			description: "Whether to enable PR comments.",
		})
		.option("config-preview-branch-excludes", {
			type: "string",
			array: true,
			description:
				"A list of branches that should not trigger a preview deployment. Wildcard syntax (`*`) is supported. Must be used with `preview_deployment_setting` set to `custom`.",
		})
		.option("config-preview-branch-includes", {
			type: "string",
			array: true,
			description:
				"A list of branches that should trigger a preview deployment. Wildcard syntax (`*`) is supported. Must be used with `preview_deployment_setting` set to `custom`.",
		})
		.option("config-preview-deployment-setting", {
			type: "string",
			description:
				"Controls whether commits to preview branches trigger a preview deployment.",
			choices: ["all", "none", "custom"],
		})
		.option("config-production-branch", {
			type: "string",
			description: "The production branch of the repository.",
		})
		.option("config-production-deployments-enabled", {
			type: "boolean",
			description:
				"Whether to trigger a production deployment on commits to the production branch.",
		})
		.option("config-repo-id", {
			type: "string",
			description: "The ID of the repository.",
		})
		.option("config-repo-name", {
			type: "string",
			description: "The name of the repository.",
		})
		.option("type", {
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
			description: "Configs for the project source control.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"pages-project-connect-project-source">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "connect-source <project-name>",
	describe: "Connect project source",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "pages projects connect-source",
				classification: {
					safeFlags: [
						"config-deployments-enabled",
						"config-pr-comments-enabled",
						"config-preview-deployment-setting",
						"config-production-deployments-enabled",
						"type",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf pages projects connect-source",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pages/projects/${argv["project-name"] == null ? "<project-name>" : encodeURIComponent(String(argv["project-name"]))}/source`,
						pathParams: { "project-name": String(argv["project-name"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										config: {
											deployments_enabled: argv["config-deployments-enabled"],
											owner: resolveFileToken(
												argv["config-owner"] as string | undefined,
												"config-owner",
												"text"
											),
											owner_id: resolveFileToken(
												argv["config-owner-id"] as string | undefined,
												"config-owner-id",
												"text"
											),
											path_excludes: argv["config-path-excludes"],
											path_includes: argv["config-path-includes"],
											pr_comments_enabled: argv["config-pr-comments-enabled"],
											preview_branch_excludes:
												argv["config-preview-branch-excludes"],
											preview_branch_includes:
												argv["config-preview-branch-includes"],
											preview_deployment_setting: resolveFileToken(
												argv["config-preview-deployment-setting"] as
													| string
													| undefined,
												"config-preview-deployment-setting",
												"text"
											),
											production_branch: resolveFileToken(
												argv["config-production-branch"] as string | undefined,
												"config-production-branch",
												"text"
											),
											production_deployments_enabled:
												argv["config-production-deployments-enabled"],
											repo_id: resolveFileToken(
												argv["config-repo-id"] as string | undefined,
												"config-repo-id",
												"text"
											),
											repo_name: resolveFileToken(
												argv["config-repo-name"] as string | undefined,
												"config-repo-name",
												"text"
											),
										},
										type: resolveFileToken(
											argv["type"] as string | undefined,
											"type",
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
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.pages.projects.connectSource({
							body: bodyData,
							account_id: accountId,
							project_name: argv["project-name"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["config-deployments-enabled"] === undefined) {
					throw new Error(
						"--config-deployments-enabled is required (or pass --body with this field set)."
					);
				}
				if (argv["config-owner"] === undefined) {
					argv["config-owner"] = await promptForRequiredField(
						"config-owner",
						"The owner of the repository."
					);
				}
				if (argv["config-owner-id"] === undefined) {
					argv["config-owner-id"] = await promptForRequiredField(
						"config-owner-id",
						"The owner ID of the repository."
					);
				}
				if (argv["config-path-excludes"] === undefined) {
					throw new Error(
						"--config-path-excludes is required (or pass --body with this field set)."
					);
				}
				if (argv["config-path-includes"] === undefined) {
					throw new Error(
						"--config-path-includes is required (or pass --body with this field set)."
					);
				}
				if (argv["config-pr-comments-enabled"] === undefined) {
					throw new Error(
						"--config-pr-comments-enabled is required (or pass --body with this field set)."
					);
				}
				if (argv["config-preview-branch-excludes"] === undefined) {
					throw new Error(
						"--config-preview-branch-excludes is required (or pass --body with this field set)."
					);
				}
				if (argv["config-preview-branch-includes"] === undefined) {
					throw new Error(
						"--config-preview-branch-includes is required (or pass --body with this field set)."
					);
				}
				if (argv["config-preview-deployment-setting"] === undefined) {
					argv["config-preview-deployment-setting"] =
						await promptForRequiredEnumField(
							"config-preview-deployment-setting",
							"Controls whether commits to preview branches trigger a preview deployment.",
							["all", "none", "custom"] as const
						);
				}
				if (argv["config-production-branch"] === undefined) {
					argv["config-production-branch"] = await promptForRequiredField(
						"config-production-branch",
						"The production branch of the repository."
					);
				}
				if (argv["config-production-deployments-enabled"] === undefined) {
					throw new Error(
						"--config-production-deployments-enabled is required (or pass --body with this field set)."
					);
				}
				if (argv["config-repo-id"] === undefined) {
					argv["config-repo-id"] = await promptForRequiredField(
						"config-repo-id",
						"The ID of the repository."
					);
				}
				if (argv["config-repo-name"] === undefined) {
					argv["config-repo-name"] = await promptForRequiredField(
						"config-repo-name",
						"The name of the repository."
					);
				}
				if (argv["type"] === undefined) {
					argv["type"] = await promptForRequiredEnumField(
						"type",
						"The source control management provider.",
						["github", "gitlab"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					config: {
						deployments_enabled: argv["config-deployments-enabled"],
						owner: resolveFileToken(
							argv["config-owner"] as string | undefined,
							"config-owner",
							"text"
						),
						owner_id: resolveFileToken(
							argv["config-owner-id"] as string | undefined,
							"config-owner-id",
							"text"
						),
						path_excludes: argv["config-path-excludes"],
						path_includes: argv["config-path-includes"],
						pr_comments_enabled: argv["config-pr-comments-enabled"],
						preview_branch_excludes: argv["config-preview-branch-excludes"],
						preview_branch_includes: argv["config-preview-branch-includes"],
						preview_deployment_setting: resolveFileToken(
							argv["config-preview-deployment-setting"] as string | undefined,
							"config-preview-deployment-setting",
							"text"
						),
						production_branch: resolveFileToken(
							argv["config-production-branch"] as string | undefined,
							"config-production-branch",
							"text"
						),
						production_deployments_enabled:
							argv["config-production-deployments-enabled"],
						repo_id: resolveFileToken(
							argv["config-repo-id"] as string | undefined,
							"config-repo-id",
							"text"
						),
						repo_name: resolveFileToken(
							argv["config-repo-name"] as string | undefined,
							"config-repo-name",
							"text"
						),
					},
					type: resolveFileToken(
						argv["type"] as string | undefined,
						"type",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.pages.projects.connectSource({
						body: bodyData,
						account_id: accountId,
						project_name: argv["project-name"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
