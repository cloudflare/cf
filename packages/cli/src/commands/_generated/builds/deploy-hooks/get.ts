import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/builds.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 builds deploy-hooks get <deploy-hook-uuid>\n\nRetrieve the name, branch, Worker identifier, and timestamps for a deploy hook."
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
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"getDeployHook">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <deploy-hook-uuid>",
	describe: "Get a deploy hook",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "builds deploy-hooks get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf builds deploy-hooks get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/workers/${argv["script-name"] == null ? "<script-name>" : encodeURIComponent(String(argv["script-name"]))}/deploy_hooks/${argv["deploy-hook-uuid"] == null ? "<deploy-hook-uuid>" : encodeURIComponent(String(argv["deploy-hook-uuid"]))}`,
						pathParams: {
							"script-name": String(argv["script-name"] ?? ""),
							"deploy-hook-uuid": String(argv["deploy-hook-uuid"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.builds.deployHooks.get({
						account_id: accountId,
						script_name: argv["script-name"],
						deploy_hook_uuid: argv["deploy-hook-uuid"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
