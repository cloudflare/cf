/**
 * screenshot command
 * @generated from apis/overlays/url-scanner.ts
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
	command: "screenshot <scan-id>",
	describe: "Get screenshot",
	usage:
		"$0 url-scanner scans screenshot <scan-id>\n\nGet scan's screenshot by resolution (desktop/mobile/tablet).",
	flags: {
		resolution: {
			kind: "enum",
			brief: "Target device type.",
			values: ["desktop", "mobile", "tablet"],
			optional: true,
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
	operands: [{ placeholder: "scan-id", brief: "Scan UUID.", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "url-scanner scans screenshot",
				classification: {
					safeFlags: ["resolution", "dry-run", "text"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					resolution: argv["resolution"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf url-scanner scans screenshot",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/urlscanner/v2/screenshots/${argv["scan-id"] == null ? "<scan-id>" : encodeURIComponent(String(argv["scan-id"]))}.png`,
						pathParams: { "scan-id": String(argv["scan-id"] ?? "") },
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
						`/accounts/${accountId}/urlscanner/v2/screenshots/${encodeURIComponent(String(argv["scan-id"]))}.png${qs ? "?" + qs : ""}`,
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
