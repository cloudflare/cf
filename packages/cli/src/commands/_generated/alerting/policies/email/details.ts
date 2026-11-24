/**
 * details command
 * @generated from apis/overlays/alerting.ts
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
import { fetchRawBytes, writeRawOutput } from "#lib/raw-fetch.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "details <policy-id>",
	describe: "Show email unsubscribe details",
	usage:
		"$0 alerting policies email details <policy-id>\n\nShows details for unsubscribing an email address from a notification policy.",
	flags: {
		email: { kind: "parsed", brief: "Email", parse: String },
		token: { kind: "parsed", brief: "Token", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "policy-id",
			brief: "The unique identifier of a notification policy",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "alerting policies email details",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					email: argv["email"],
					token: argv["token"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf alerting policies email details",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/alerting/v3/policies/${argv["policy-id"] == null ? "<policy-id>" : encodeURIComponent(String(argv["policy-id"]))}/email/unsubscribe`,
						pathParams: { "policy-id": String(argv["policy-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const __cfRawBytes = await withProgress(`Loading`, async () =>
					fetchRawBytes(
						`/accounts/${accountId}/alerting/v3/policies/${encodeURIComponent(String(argv["policy-id"]))}/email/unsubscribe${qs ? "?" + qs : ""}`,
						{
							method: "GET",
							local: argv.local === true,
							persistTo: argv.persistTo as string | undefined,
						}
					)
				);
				writeRawOutput(__cfRawBytes.toString("utf-8"));
				return;
			}
		),
});

export default command;
