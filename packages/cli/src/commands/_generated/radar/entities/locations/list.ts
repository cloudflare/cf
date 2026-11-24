import operation from "../../../_operations/radar/entities/locations/list.js";
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
	describe: "List locations",
	usage: "$0 radar entities locations list\n\nRetrieves a list of locations.",
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
		location: {
			kind: "parsed",
			brief:
				"Filters results by location. Specify a comma-separated list of alpha-2 location codes.",
			optional: true,
			parse: String,
		},
		region: {
			kind: "parsed",
			brief: "Filters results by region.",
			optional: true,
			parse: String,
		},
		subregion: {
			kind: "parsed",
			brief: "Filters results by subregion.",
			optional: true,
			parse: String,
		},
		continent: {
			kind: "enum",
			brief: "Filters results by continent code.",
			values: ["AF", "AS", "EU", "NA", "OC", "SA"],
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
				command: "radar entities locations list",
				classification: {
					safeFlags: ["continent", "format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					limit: argv["limit"],
					offset: argv["offset"],
					location: argv["location"],
					region: argv["region"],
					subregion: argv["subregion"],
					continent: argv["continent"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar entities locations list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/entities/locations`,
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
