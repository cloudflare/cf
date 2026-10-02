import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/workers-builds.ts
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 workers-builds workers previews edit <preview-id>\n\nUpdate a single Preview of a Worker. Supports partial updates to the tracked branch, the automation flags, and the build settings."
		)
		.positional("preview-id", {
			type: "string",
			description:
				"The script tag of the Preview, which is a Worker in its own right",
			demandOption: true,
		})
		.option("script-tag", {
			type: "string",
			description: "The Worker script tag (external script ID)",
			demandOption: true,
		})
		.option("auto-build", {
			type: "boolean",
			description:
				"Whether pushes to the git branch build this Preview. Deploy hooks, manual builds, and retries run regardless of this setting.",
		})
		.option("auto-delete", {
			type: "boolean",
			description: "Whether deleting the git branch also deletes this Preview.",
		})
		.option("branch", {
			type: "string",
			description: "Git branch this Preview tracks",
		})
		.option("settings-build-caching-enabled", {
			type: "boolean",
			description:
				"Whether builds reuse cached dependencies and build artifacts.",
		})
		.option("settings-build-command", {
			type: "string",
			description: "Command to build the Worker.",
		})
		.option("settings-build-token-uuid", {
			type: "string",
			description: "UUID of the build token used when deploying the Worker.",
		})
		.option("settings-deploy-command", {
			type: "string",
			description: "Command to deploy the Worker.",
		})
		.option("settings-path-excludes", {
			type: "string",
			array: true,
			description: "Path patterns that must not start builds.",
		})
		.option("settings-path-includes", {
			type: "string",
			array: true,
			description: "Path patterns that can start builds.",
		})
		.option("settings-root-directory", {
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
				"Request body for updating a Preview. At least one field must be provided, and omitted fields are left unchanged.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"updateWorkerPreview">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <preview-id>",
	describe: "Update preview",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "workers-builds workers previews edit",
				classification: {
					safeFlags: [
						"auto-build",
						"auto-delete",
						"settings-build-caching-enabled",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf workers-builds workers previews edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/workers/${argv["script-tag"] == null ? "<script-tag>" : encodeURIComponent(String(argv["script-tag"]))}/previews/${argv["preview-id"] == null ? "<preview-id>" : encodeURIComponent(String(argv["preview-id"]))}`,
						pathParams: {
							"script-tag": String(argv["script-tag"] ?? ""),
							"preview-id": String(argv["preview-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										auto_build: argv["auto-build"],
										auto_delete: argv["auto-delete"],
										branch: resolveFileToken(
											argv["branch"] as string | undefined,
											"branch",
											"text"
										),
										settings: {
											build_caching_enabled:
												argv["settings-build-caching-enabled"],
											build_command: resolveFileToken(
												argv["settings-build-command"] as string | undefined,
												"settings-build-command",
												"text"
											),
											build_token_uuid: resolveFileToken(
												argv["settings-build-token-uuid"] as string | undefined,
												"settings-build-token-uuid",
												"text"
											),
											deploy_command: resolveFileToken(
												argv["settings-deploy-command"] as string | undefined,
												"settings-deploy-command",
												"text"
											),
											path_excludes: argv["settings-path-excludes"],
											path_includes: argv["settings-path-includes"],
											root_directory: resolveFileToken(
												argv["settings-root-directory"] as string | undefined,
												"settings-root-directory",
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
					const result = await withProgress(`Updating`, async () =>
						client.workersBuilds.workers.previews.edit({
							...bodyData,
							account_id: accountId,
							script_tag: argv["script-tag"],
							preview_id: argv["preview-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					auto_build: argv["auto-build"],
					auto_delete: argv["auto-delete"],
					branch: resolveFileToken(
						argv["branch"] as string | undefined,
						"branch",
						"text"
					),
					settings: {
						build_caching_enabled: argv["settings-build-caching-enabled"],
						build_command: resolveFileToken(
							argv["settings-build-command"] as string | undefined,
							"settings-build-command",
							"text"
						),
						build_token_uuid: resolveFileToken(
							argv["settings-build-token-uuid"] as string | undefined,
							"settings-build-token-uuid",
							"text"
						),
						deploy_command: resolveFileToken(
							argv["settings-deploy-command"] as string | undefined,
							"settings-deploy-command",
							"text"
						),
						path_excludes: argv["settings-path-excludes"],
						path_includes: argv["settings-path-includes"],
						root_directory: resolveFileToken(
							argv["settings-root-directory"] as string | undefined,
							"settings-root-directory",
							"text"
						),
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.workersBuilds.workers.previews.edit({
						...bodyData,
						account_id: accountId,
						script_tag: argv["script-tag"],
						preview_id: argv["preview-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
