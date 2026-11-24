/**
 * get-receipt-pdf command
 * @generated from apis/overlays/accounts.ts
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
	command: "get-receipt-pdf <receipt-id>",
	describe: "Get Receipt PDF",
	usage:
		"$0 accounts billing get-receipt-pdf <receipt-id>\n\nDownloads a receipt as a PDF document.",
	flags: {
		doctype: {
			kind: "parsed",
			brief: "The document type to generate.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		text: {
			kind: "boolean",
			brief:
				"Decode the response body as UTF-8 text instead of writing raw bytes",
			default: false,
		},
	},
	operands: [
		{ placeholder: "receipt-id", brief: "Receipt identifier.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "accounts billing get-receipt-pdf",
				classification: {
					safeFlags: ["dry-run", "text"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					doctype: argv["doctype"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf accounts billing get-receipt-pdf",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/receipts/${argv["receipt-id"] == null ? "<receipt-id>" : encodeURIComponent(String(argv["receipt-id"]))}/pdf`,
						pathParams: { "receipt-id": String(argv["receipt-id"] ?? "") },
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
						`/accounts/${accountId}/receipts/${encodeURIComponent(String(argv["receipt-id"]))}/pdf${qs ? "?" + qs : ""}`,
						{
							method: "GET",
							local: argv.local === true,
							persistTo: argv.persistTo as string | undefined,
						}
					)
				);
				writeRawOutput(
					argv.text === true ? __cfRawBytes.toString("utf-8") : __cfRawBytes
				);
				return;
			}
		),
});

export default command;
