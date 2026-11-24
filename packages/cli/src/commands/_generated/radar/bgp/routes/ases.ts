import operation from "../../../_operations/radar/bgp/routes/ases.js";
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
	describe: "List ASes from global routing tables",
	usage:
		"$0 radar bgp routes ases\n\nRetrieves all ASes in the current global routing tables with routing statistics.",
	flags: {
		location: {
			kind: "parsed",
			brief: "Filters results by location. Specify an alpha-2 location code.",
			optional: true,
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief: "Limits the number of objects returned in the response.",
			optional: true,
			parse: Number,
		},
		"sort-by": {
			kind: "enum",
			brief: "Sorts results by the specified field.",
			values: [
				"cone",
				"pfxs",
				"ipv4",
				"ipv6",
				"rpki_valid",
				"rpki_invalid",
				"rpki_unknown",
			],
			optional: true,
		},
		"sort-order": {
			kind: "enum",
			brief: "Sort order.",
			values: ["ASC", "DESC"],
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
				command: "radar bgp routes ases",
				classification: {
					safeFlags: ["sort-by", "sort-order", "format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					location: argv["location"],
					limit: argv["limit"],
					sortBy: argv["sort-by"],
					sortOrder: argv["sort-order"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar bgp routes ases",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/bgp/routes/ases`,
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
