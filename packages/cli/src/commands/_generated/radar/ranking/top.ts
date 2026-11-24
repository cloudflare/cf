import operation from "../../_operations/radar/ranking/top.js";
/**
 * top command
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
	command: "top",
	describe: "Get top or trending domains",
	usage:
		"$0 radar ranking top\n\nRetrieves the top or trending domains based on their rank. Popular domains are domains of broad appeal based on how people use the Internet. Trending domains are domains that are generating a surge in interest. For more information on top domains, see https://blog.cloudflare.com/radar-domain-rankings/.",
	flags: {
		limit: {
			kind: "parsed",
			brief: "Limits the number of objects returned in the response.",
			optional: true,
			parse: Number,
		},
		name: {
			kind: "parsed",
			brief: "Array of names used to label the series in the response.",
			variadic: true,
			optional: true,
			parse: String,
		},
		location: {
			kind: "parsed",
			brief:
				"Filters results by location. Specify a comma-separated list of alpha-2 location codes.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"domain-category": {
			kind: "parsed",
			brief: "Filters results by domain category.",
			variadic: true,
			optional: true,
			parse: String,
		},
		date: {
			kind: "parsed",
			brief: "Filters results by the specified array of dates.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"ranking-type": {
			kind: "enum",
			brief: "The ranking type.",
			values: ["POPULAR", "TRENDING_RISE", "TRENDING_STEADY"],
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
				command: "radar ranking top",
				classification: {
					safeFlags: ["ranking-type", "format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					limit: argv["limit"],
					name: argv["name"],
					location: argv["location"],
					domainCategory: argv["domain-category"],
					date: argv["date"],
					rankingType: argv["ranking-type"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar ranking top",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/ranking/top`,
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
