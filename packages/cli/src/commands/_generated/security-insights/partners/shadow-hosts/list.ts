/**
 * list command
 * @generated from apis/overlays/security-insights.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { fetchRawBytes, writeRawOutput } from "#lib/raw-fetch.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "list",
	describe: "Lists Partner-Discovered Shadow Hosts for a Zone",
	usage:
		"$0 security-insights partners shadow-hosts list\n\nLists partner-discovered hosts beneath the zone that are not in the account.",
	flags: {
		partner: {
			kind: "parsed",
			brief: "The partner integration identifier.",
			parse: String,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Opaque cursor from the previous response's `result_info.cursor`. Omit for the first page.",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"Number of premium partner asset results per page. Values other than 1 must be a multiple of 5.",
			optional: true,
			parse: Number,
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
				command: "security-insights partners shadow-hosts list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					cursor: argv["cursor"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf security-insights partners shadow-hosts list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/security-center/partners/${argv["partner"] == null ? "<partner>" : encodeURIComponent(String(argv["partner"]))}/shadow-hosts`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							partner: String(argv["partner"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const __cfRawBytes = await withProgress(`Loading`, async () =>
					fetchRawBytes(
						`/zones/${argv.zoneId}/security-center/partners/${encodeURIComponent(String(argv["partner"]))}/shadow-hosts${qs ? "?" + qs : ""}`,
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
