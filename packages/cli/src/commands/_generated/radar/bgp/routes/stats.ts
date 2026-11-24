import operation from "../../../_operations/radar/bgp/routes/stats.js";
/**
 * stats command
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
	command: "stats",
	describe: "Get BGP routing table stats",
	usage: "$0 radar bgp routes stats\n\nRetrieves the BGP routing table stats.",
	flags: {
		asn: {
			kind: "parsed",
			brief:
				"Filters results by Autonomous System. Specify a single Autonomous System Number (ASN) as integer.",
			optional: true,
			parse: Number,
		},
		location: {
			kind: "parsed",
			brief: "Filters results by location. Specify an alpha-2 location code.",
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
				command: "radar bgp routes stats",
				classification: {
					safeFlags: ["format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					asn: argv["asn"],
					location: argv["location"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar bgp routes stats",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/bgp/routes/stats`,
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
