import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/builds.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 builds workers update <script-tag>\n\nUpdate the build configuration for a Worker script. Supports partial updates to git repository settings, production build settings, and Preview settings."
		)
		.positional("script-tag", {
			type: "string",
			description: "The Worker script tag (external script ID)",
			demandOption: true,
		})
		.option("patch-existing-previews", {
			type: "string",
			description:
				"Apply a previews_base_config patch to every existing Preview of the Worker as well as to the base config.",
			choices: ["true", "false"],
		})
		.option("git-repository-branch", {
			type: "string",
			description: "New git branch to watch for builds",
		})
		.option("previews-base-config-build-caching-enabled", {
			type: "boolean",
			description:
				"Whether builds reuse cached dependencies and build artifacts.",
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
		})
		.option("previews-enabled", {
			type: "boolean",
			description:
				"Enable or disable Previews for this Worker. Enabling requires previews_base_config to already exist or to be sent in the same request.",
		})
		.option("production-settings-build-caching-enabled", {
			type: "boolean",
			description:
				"Whether builds reuse cached dependencies and build artifacts.",
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
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Request body for updating a Worker build configuration. At least one field must be provided.",
		});
}

type Request = SdkRequest<"updateWorkerBuild">;
type Body = Request;
type Query = SdkQuery<"updateWorkerBuild">;

const typedBuilder = withArgTypes<
	{
		"patch-existing-previews": Query["patch_existing_previews"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <script-tag>",
	describe: "Update Worker build configuration",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "builds workers update",
				classification: {
					safeFlags: [
						"patch-existing-previews",
						"previews-base-config-build-caching-enabled",
						"previews-enabled",
						"production-settings-build-caching-enabled",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					patch_existing_previews: argv["patch-existing-previews"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf builds workers update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/workers/${argv["script-tag"] == null ? "<script-tag>" : encodeURIComponent(String(argv["script-tag"]))}`,
						pathParams: { "script-tag": String(argv["script-tag"] ?? "") },
						query: queryParams,
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
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const qs = new URLSearchParams(
						Object.entries(queryParams)
							.filter(([, v]) => v !== undefined)
							.map(([k, v]) => [k, String(v)])
					).toString();
					const result = await withProgress(`Updating`, async () =>
						client.builds.workers.update({
							...bodyData,
							account_id: accountId,
							script_tag: argv["script-tag"],
							...queryParams,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
				});
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Updating`, async () =>
					client.builds.workers.update({
						...bodyData,
						account_id: accountId,
						script_tag: argv["script-tag"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
