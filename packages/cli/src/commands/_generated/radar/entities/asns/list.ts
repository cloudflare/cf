import operation from "../../../_operations/radar/entities/asns/list.js";
/**
 * list command
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
	command: "list",
	describe: "List autonomous systems",
	usage:
		"$0 radar entities asns list\n\nRetrieves a list of autonomous systems.",
	flags: {
		limit: {
			kind: "parsed",
			brief: "Limits the number of objects returned in the response.",
			optional: true,
			parse: Number,
		},
		offset: {
			kind: "parsed",
			brief:
				"Skips the specified number of objects before fetching the results.",
			optional: true,
			parse: Number,
		},
		asn: {
			kind: "parsed",
			brief:
				"Filters results by Autonomous System. Specify one or more Autonomous System Numbers (ASNs) as a comma-separated list.",
			optional: true,
			parse: String,
		},
		location: {
			kind: "parsed",
			brief: "Filters results by location. Specify an alpha-2 location code.",
			optional: true,
			parse: String,
		},
		"order-by": {
			kind: "enum",
			brief: "Specifies the metric to order the ASNs by.",
			values: ["ASN", "POPULATION"],
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
				command: "radar entities asns list",
				classification: {
					safeFlags: ["order-by", "format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					limit: argv["limit"],
					offset: argv["offset"],
					asn: argv["asn"],
					location: argv["location"],
					orderBy: argv["order-by"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar entities asns list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/entities/asns`,
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
