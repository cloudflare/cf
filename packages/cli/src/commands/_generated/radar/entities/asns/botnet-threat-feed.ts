import { createCommandClient } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery } from "#sdk";
/**
 * botnet-threat-feed command
 * @generated from apis/overlays/radar.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 radar entities asns botnet-threat-feed\n\nRetrieves a ranked list of Autonomous Systems based on their presence in the Cloudflare Botnet Threat Feed. Rankings can be sorted by offense count or number of bad IPs. Optionally compare to a previous date to see rank changes."
		)
		.option("limit", {
			type: "number",
			description: "Limits the number of objects returned in the response.",
		})
		.option("offset", {
			type: "number",
			description:
				"Skips the specified number of objects before fetching the results.",
		})
		.option("metric", {
			type: "string",
			description: "Metric to rank ASNs by.",
			choices: ["OFFENSE_COUNT", "NUMBER_OF_OFFENDING_IPS"],
		})
		.option("date", {
			type: "string",
			description:
				"The date to retrieve (YYYY-MM-DD format). If not specified, returns the most recent available data. Note: This is the date the report was generated. The report is generated from information collected from the previous day (e.g., the 2026-02-23 entry contains data from 2026-02-22).",
		})
		.option("compare-date-range", {
			type: "string",
			description:
				'Relative date range for rank change comparison (e.g., "1d", "7d", "30d").',
		})
		.option("location", {
			type: "string",
			description:
				"Filters results by location. Specify an alpha-2 location code.",
		})
		.option("asn", {
			type: "string",
			description:
				"Filters results by Autonomous System. Specify one or more Autonomous System Numbers (ASNs) as a comma-separated list. Prefix with `-` to exclude ASNs from results. For example, `-174, 3356` excludes results from AS174, but includes results from AS3356.",
		})
		.option("sort-order", {
			type: "string",
			description: "Sort order.",
			choices: ["ASC", "DESC"],
		})
		.option("format", {
			type: "string",
			description: "Format in which results will be returned.",
			choices: ["JSON", "CSV"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Query = SdkQuery<"radar-get-as-botnet-threat-feed">;

const typedBuilder = withArgTypes<
	{
		metric: Query["metric"];
		"sort-order": Query["sortOrder"];
		format: Query["format"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "botnet-threat-feed",
	describe: "Get AS rankings by botnet threat feed activity",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar entities asns botnet-threat-feed",
				classification: {
					safeFlags: ["metric", "sort-order", "format", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					limit: argv["limit"],
					offset: argv["offset"],
					metric: argv["metric"],
					date: argv["date"],
					compareDateRange: argv["compare-date-range"],
					location: argv["location"],
					asn: argv["asn"],
					sortOrder: argv["sort-order"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar entities asns botnet-threat-feed",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/entities/asns/botnet_threat_feed`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.radar.entities.asns.botnetThreatFeed(queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
