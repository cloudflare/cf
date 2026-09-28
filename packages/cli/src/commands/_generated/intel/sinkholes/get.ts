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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/intel.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 intel sinkholes get <sinkhole-id>\n\nGet the specified sinkhole by its unique identifier."
		)
		.positional("sinkhole-id", {
			type: "string",
			description: "The unique identifier for the sinkhole.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"sinkhole-config-get-sinkhole">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <sinkhole-id>",
	describe: "Get a sinkhole",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "intel sinkholes get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf intel sinkholes get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/intel/sinkholes/${argv["sinkhole-id"] == null ? "<sinkhole-id>" : encodeURIComponent(String(argv["sinkhole-id"]))}`,
						pathParams: { "sinkhole-id": String(argv["sinkhole-id"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.intel.sinkholes.get({
						account_id: accountId,
						sinkhole_id: argv["sinkhole-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
