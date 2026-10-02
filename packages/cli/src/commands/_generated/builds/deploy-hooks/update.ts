import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
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
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 builds deploy-hooks update <deploy-hook-uuid>\n\nReplace the name and target branch for a deploy hook."
		)
		.positional("deploy-hook-uuid", {
			type: "string",
			description: "Deploy hook UUID",
			demandOption: true,
		})
		.option("script-name", {
			type: "string",
			description: "Human-readable name of the worker.",
			demandOption: true,
		})
		.option("branch", { type: "string", description: "Git branch name." })
		.option("deploy-hook-name", {
			type: "string",
			description: "Deploy hook name (1-58 characters).",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"updateDeployHook">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <deploy-hook-uuid>",
	describe: "Update a deploy hook",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "builds deploy-hooks update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf builds deploy-hooks update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/workers/${argv["script-name"] == null ? "<script-name>" : encodeURIComponent(String(argv["script-name"]))}/deploy_hooks/${argv["deploy-hook-uuid"] == null ? "<deploy-hook-uuid>" : encodeURIComponent(String(argv["deploy-hook-uuid"]))}`,
						pathParams: {
							"script-name": String(argv["script-name"] ?? ""),
							"deploy-hook-uuid": String(argv["deploy-hook-uuid"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										branch: resolveFileToken(
											argv["branch"] as string | undefined,
											"branch",
											"text"
										),
										deploy_hook_name: resolveFileToken(
											argv["deploy-hook-name"] as string | undefined,
											"deploy-hook-name",
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
					const result = await withProgress(`Updating`, async () =>
						client.builds.deployHooks.update({
							body: bodyData,
							account_id: accountId,
							script_name: argv["script-name"],
							deploy_hook_uuid: argv["deploy-hook-uuid"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["branch"] === undefined) {
					argv["branch"] = await promptForRequiredField(
						"branch",
						"Git branch name."
					);
				}
				if (argv["deploy-hook-name"] === undefined) {
					argv["deploy-hook-name"] = await promptForRequiredField(
						"deploy-hook-name",
						"Deploy hook name (1-58 characters)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					branch: resolveFileToken(
						argv["branch"] as string | undefined,
						"branch",
						"text"
					),
					deploy_hook_name: resolveFileToken(
						argv["deploy-hook-name"] as string | undefined,
						"deploy-hook-name",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.builds.deployHooks.update({
						body: bodyData,
						account_id: accountId,
						script_name: argv["script-name"],
						deploy_hook_uuid: argv["deploy-hook-uuid"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
