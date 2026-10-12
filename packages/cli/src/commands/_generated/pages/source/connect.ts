import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * connect command
 * @generated from apis/overlays/pages.ts
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
			"$0 pages source connect <project-name>\n\nConnect a GitHub or GitLab repository to a Cloudflare Pages project to enable Git-based deployments."
		)
		.positional("project-name", {
			type: "string",
			description:
				"Name of the Pages project. Must begin with a lowercase letter or digit and contain only lowercase letters, digits, and hyphens.",
			demandOption: true,
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
		.option("type", {
			type: "string",
			description: "The source control management provider.",
			choices: ["github", "gitlab"],
		})
		.coerce("type", (value) => resolveFileToken(value, "type", "text"))
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Repository and deployment settings for connecting a Git repository to a Pages project.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"pages-project-connect-project-source">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "connect <project-name>",
	describe: "Connect a Git repository",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "pages source connect",
				classification: {
					safeFlags: [
						"source-config-deployments-enabled",
						"source-config-pr-comments-enabled",
						"source-config-preview-deployment-setting",
						"source-config-production-deployments-enabled",
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
						command: "cf pages source connect",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pages/projects/${argv["project-name"] == null ? "<project-name>" : encodeURIComponent(String(argv["project-name"]))}/source`,
						pathParams: { "project-name": String(argv["project-name"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
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
										type: argv["type"],
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
						client.pages.source.connect({
							...bodyData,
							account_id: accountId,
							project_name: argv["project-name"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["source-config-deployments-enabled"] === undefined) {
					throw new Error(
						"--source-config-deployments-enabled is required (or pass --body with this field set)."
					);
				}
				if (argv["source-config-owner"] === undefined) {
					argv["source-config-owner"] = await promptForRequiredField(
						"source-config-owner",
						"The owner of the repository."
					);
				}
				if (argv["source-config-owner-id"] === undefined) {
					argv["source-config-owner-id"] = await promptForRequiredField(
						"source-config-owner-id",
						"The owner ID of the repository."
					);
				}
				if (argv["source-config-path-excludes"] === undefined) {
					throw new Error(
						"--source-config-path-excludes is required (or pass --body with this field set)."
					);
				}
				if (argv["source-config-path-includes"] === undefined) {
					throw new Error(
						"--source-config-path-includes is required (or pass --body with this field set)."
					);
				}
				if (argv["source-config-pr-comments-enabled"] === undefined) {
					throw new Error(
						"--source-config-pr-comments-enabled is required (or pass --body with this field set)."
					);
				}
				if (argv["source-config-preview-branch-excludes"] === undefined) {
					throw new Error(
						"--source-config-preview-branch-excludes is required (or pass --body with this field set)."
					);
				}
				if (argv["source-config-preview-branch-includes"] === undefined) {
					throw new Error(
						"--source-config-preview-branch-includes is required (or pass --body with this field set)."
					);
				}
				if (argv["source-config-preview-deployment-setting"] === undefined) {
					argv["source-config-preview-deployment-setting"] =
						await promptForRequiredEnumField(
							"source-config-preview-deployment-setting",
							"Controls whether commits to preview branches trigger a preview deployment.",
							["all", "none", "custom"] as const
						);
				}
				if (argv["source-config-production-branch"] === undefined) {
					argv["source-config-production-branch"] =
						await promptForRequiredField(
							"source-config-production-branch",
							"The production branch of the repository."
						);
				}
				if (
					argv["source-config-production-deployments-enabled"] === undefined
				) {
					throw new Error(
						"--source-config-production-deployments-enabled is required (or pass --body with this field set)."
					);
				}
				if (argv["source-config-repo-id"] === undefined) {
					argv["source-config-repo-id"] = await promptForRequiredField(
						"source-config-repo-id",
						"The ID of the repository."
					);
				}
				if (argv["source-config-repo-name"] === undefined) {
					argv["source-config-repo-name"] = await promptForRequiredField(
						"source-config-repo-name",
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
					type: argv["type"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.pages.source.connect({
						...bodyData,
						account_id: accountId,
						project_name: argv["project-name"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
