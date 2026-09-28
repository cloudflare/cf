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
 * timeseries command
 * @generated from apis/overlays/radar.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 radar bgp rpki aspa timeseries\n\nRetrieves ASPA (Autonomous System Provider Authorization) object count over time. Supports filtering by RIR or location (country code) to generate multiple named series. If no RIR or location filter is specified, returns total count."
		)
		.option("date-start", {
			type: "string",
			description:
				"Start of the date range (inclusive). Alternative to `dateRange`; provide together with `dateEnd`.",
		})
		.option("date-end", {
			type: "string",
			description:
				"End of the date range (inclusive). Alternative to `dateRange`; provide together with `dateStart`.",
		})
		.option("name", {
			type: "string",
			description: "Array of names used to label the series in the response.",
		})
		.option("rir", {
			type: "string",
			description:
				"Filter by Regional Internet Registry (RIR). Multiple RIRs generate multiple series.",
		})
		.option("location", {
			type: "string",
			description:
				"Filters results by location. Specify a comma-separated list of alpha-2 location codes.",
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

type Query = SdkQuery<"radar-get-bgp-rpki-aspa-timeseries">;

const typedBuilder = withArgTypes<
	{
		rir: Query["rir"];
		format: Query["format"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "timeseries",
	describe: "Get ASPA count time series",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar bgp rpki aspa timeseries",
				classification: {
					safeFlags: ["format", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					dateStart: argv["date-start"],
					dateEnd: argv["date-end"],
					name: argv["name"],
					rir: argv["rir"],
					location: argv["location"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar bgp rpki aspa timeseries",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/bgp/rpki/aspa/timeseries`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.radar.bgp.rpki.aspa.timeseries(queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
