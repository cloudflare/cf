import operation from "../../../_operations/radar/ranking/domain/get.js";
/**
 * get command
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
	command: "get <domain>",
	describe: "Get domain rank details",
	usage:
		"$0 radar ranking domain get <domain>\n\nRetrieves domain rank details. Cloudflare provides an ordered rank for the top 100 domains, but for the remainder it only provides ranking buckets like top 200 thousand, top one million, etc.. These are available through Radar datasets endpoints.",
	flags: {
		limit: {
			kind: "parsed",
			brief: "Limits the number of objects returned in the response.",
			optional: true,
			parse: Number,
		},
		"ranking-type": {
			kind: "enum",
			brief: "The ranking type.",
			values: ["POPULAR", "TRENDING_RISE", "TRENDING_STEADY"],
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "Array of names used to label the series in the response.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"include-top-locations": {
			kind: "boolean",
			brief: "Includes top locations in the response.",
			optional: true,
		},
		date: {
			kind: "parsed",
			brief: "Filters results by the specified array of dates.",
			variadic: true,
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
	operands: [{ placeholder: "domain", brief: "Domain name.", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar ranking domain get",
				classification: {
					safeFlags: [
						"ranking-type",
						"include-top-locations",
						"format",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					limit: argv["limit"],
					rankingType: argv["ranking-type"],
					name: argv["name"],
					includeTopLocations: argv["include-top-locations"],
					date: argv["date"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar ranking domain get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/ranking/domain/${argv["domain"] == null ? "<domain>" : encodeURIComponent(String(argv["domain"]))}`,
						pathParams: { domain: String(argv["domain"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { domain: argv["domain"], ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
