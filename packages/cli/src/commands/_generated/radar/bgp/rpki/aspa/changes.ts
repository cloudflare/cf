import operation from "../../../../_operations/radar/bgp/rpki/aspa/changes.js";
/**
 * changes command
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
	command: "changes",
	describe: "Get ASPA changes over time",
	usage:
		"$0 radar bgp rpki aspa changes\n\nRetrieves ASPA (Autonomous System Provider Authorization) changes over time. Returns daily aggregated changes including additions, removals, and modifications of ASPA objects.",
	flags: {
		"date-start": {
			kind: "parsed",
			brief:
				"Start of the date range (inclusive). Alternative to `dateRange`; provide together with `dateEnd`.",
			optional: true,
			parse: String,
		},
		"date-end": {
			kind: "parsed",
			brief:
				"End of the date range (inclusive). Alternative to `dateRange`; provide together with `dateStart`.",
			optional: true,
			parse: String,
		},
		asn: {
			kind: "parsed",
			brief: "Filter changes involving this ASN (as customer or provider).",
			optional: true,
			parse: Number,
		},
		"include-asn-info": {
			kind: "boolean",
			brief: "Include ASN metadata (name, country) in response.",
			optional: true,
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
				command: "radar bgp rpki aspa changes",
				classification: {
					safeFlags: ["include-asn-info", "format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					dateStart: argv["date-start"],
					dateEnd: argv["date-end"],
					asn: argv["asn"],
					includeAsnInfo: argv["include-asn-info"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar bgp rpki aspa changes",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/bgp/rpki/aspa/changes`,
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
