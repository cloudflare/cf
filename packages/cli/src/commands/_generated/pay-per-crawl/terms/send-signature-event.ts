import operation from "../../_operations/pay-per-crawl/terms/send-signature-event.js";
/**
 * send-signature-event command
 * @generated from apis/overlays/pay-per-crawl.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "send-signature-event",
	describe: "Record pay-per-crawl terms activity",
	usage:
		"$0 pay-per-crawl terms send-signature-event\n\nRecords that an account displayed or agreed to the pay-per-crawl terms.",
	flags: {
		"event-type": {
			kind: "enum",
			brief: "The terms activity to record.",
			values: ["agreed", "displayed"],
		},
		vid: {
			kind: "parsed",
			brief: "Ironclad contract version ID.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "pay-per-crawl terms send-signature-event",
				classification: {
					safeFlags: ["event-type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					event_type: argv["event-type"],
					vid: argv["vid"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf pay-per-crawl terms send-signature-event",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pay-per-crawl/terms/signature`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { account_id: accountId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
