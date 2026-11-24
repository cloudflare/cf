import operation from "../../../../_operations/radar/bgp/ips/top/ases.js";
/**
 * ases command
 * @generated from apis/overlays/radar.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "ases",
	describe: "Get top ASes by announced IP space",
	usage:
		"$0 radar bgp ips top ases\n\nReturns the top-N autonomous systems by announced IP space at the nearest 8-hour RIB boundary at or before the requested date. The snapped boundary is returned as `anchor_ts`.",
	flags: {
		date: {
			kind: "parsed",
			brief: "Filters results by the specified datetime (ISO 8601).",
			optional: true,
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief: "Limits the number of objects returned in the response.",
			optional: true,
			parse: Number,
		},
		metric: {
			kind: "enum",
			brief: "Ranking metric: IPv4 /24 count or IPv6 /48 count.",
			values: ["v4_24s", "v6_48s"],
			optional: true,
		},
		country: {
			kind: "parsed",
			brief:
				"Optional ISO 3166-1 alpha-2 country filter. Omit for global top-N.",
			optional: true,
			parse: String,
		},
		format: {
			kind: "enum",
			brief: "Format in which results will be returned.",
			values: ["JSON", "CSV"],
			optional: true,
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
				command: "radar bgp ips top ases",
				classification: {
					safeFlags: ["metric", "format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					date: argv["date"],
					limit: argv["limit"],
					metric: argv["metric"],
					country: argv["country"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar bgp ips top ases",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/bgp/ips/top/ases`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
