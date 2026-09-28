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
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * day-report command
 * @generated from apis/overlays/botnet-feed.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 botnet-feed asn day-report <asn-id>\n\nGets all the data the botnet tracking database has for a given ASN registered to user account for given date. If no date is given, it will return results for the previous day."
		)
		.positional("asn-id", {
			type: "string",
			description: "Asn ID",
			demandOption: true,
		})
		.option("date", { type: "string", description: "Date" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"botnet-threat-feed-get-day-report">;
type Query = SdkQuery<"botnet-threat-feed-get-day-report">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "day-report <asn-id>",
	describe: "Get daily report",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "botnet-feed asn day-report",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					date: argv["date"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf botnet-feed asn day-report",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/botnet_feed/asn/${argv["asn-id"] == null ? "<asn-id>" : encodeURIComponent(String(argv["asn-id"]))}/day_report`,
						pathParams: { "asn-id": String(argv["asn-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.botnetFeed.asn.dayReport({
						account_id: accountId,
						asn_id: argv["asn-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
