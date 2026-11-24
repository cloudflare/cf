import operation from "../../_operations/email-security/investigate/get.js";
/**
 * get command
 * @generated from apis/overlays/email-security.ts
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
	command: "get <investigate-id>",
	describe: "Get message details",
	usage:
		"$0 email-security investigate get <investigate-id>\n\nRetrieves comprehensive details for a specific email message including headers, recipients, sender information, and current quarantine status. Use the investigate_id from search results to fetch detailed information.",
	flags: {
		submission: {
			kind: "boolean",
			brief:
				"When true, search the submissions datastore only. When false or omitted, search the\nregular datastore only.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "investigate-id",
			brief: "Unique identifier for a message retrieved from investigation.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security investigate get",
				classification: {
					safeFlags: ["submission", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					submission: argv["submission"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security investigate get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/investigate/${argv["investigate-id"] == null ? "<investigate-id>" : encodeURIComponent(String(argv["investigate-id"]))}`,
						pathParams: {
							"investigate-id": String(argv["investigate-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						account_id: accountId,
						investigate_id: argv["investigate-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
