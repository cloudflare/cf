import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/radar.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 radar annotations outages get\n\nRetrieves the latest Internet outages and anomalies."
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
		.option("date-range", {
			type: "string",
			description:
				"Filters results by a relative date range ending at the current time. Use `<n>d` for days (up to `364d`) or `<n>w` for weeks (up to `52w`), e.g. `7d`. Append `control` to request the equivalent previous period for comparison: the comparison window is shifted back by the current window's length rounded up to a whole number of weeks, so it keeps the same weekday alignment and does not overlap the current window (e.g. `3dcontrol` covers days -10 to -7, `7dcontrol` covers days -14 to -7, `28dcontrol` covers days -56 to -28, and `10dcontrol` covers days -24 to -14). Mutually exclusive with `dateStart`/`dateEnd`.",
		})
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
		.option("data-source", {
			type: "string",
			description: "Filters results by data source.",
			choices: [
				"ALL",
				"AI_BOTS",
				"AI_GATEWAY",
				"BGP",
				"BOTS",
				"CONNECTION_ANOMALY",
				"CT",
				"DNS",
				"DNS_MAGNITUDE",
				"DNS_AS112",
				"DOS",
				"EMAIL_ROUTING",
				"EMAIL_SECURITY",
				"FW",
				"FW_PG",
				"HTTP",
				"HTTP_CONTROL",
				"HTTP_CRAWLER_REFERER",
				"HTTP_ORIGINS",
				"IQI",
				"LEAKED_CREDENTIALS",
				"NET",
				"ROBOTS_TXT",
				"SPEED",
				"WORKERS_AI",
			],
		})
		.option("outage-type", {
			type: "string",
			description: "Filters results by outage type.",
			choices: ["NATIONWIDE", "REGIONAL", "NETWORK", "PLATFORM"],
		})
		.option("outage-cause", {
			type: "string",
			description: "Filters results by outage cause.",
			choices: [
				"BLOCKING",
				"CABLE_CUT",
				"CYBERATTACK",
				"DNS",
				"FIRE",
				"GOVERNMENT_DIRECTED",
				"MAINTENANCE",
				"MECHANICAL",
				"MILITARY_ACTION",
				"MISCONFIGURATION",
				"NATURAL_DISASTER",
				"NETWORK_PROBLEM",
				"POWER_OUTAGE",
				"SOFTWARE",
				"TECHNICAL_PROBLEM",
				"UNKNOWN",
				"WEATHER",
			],
		})
		.option("tags", {
			type: "string",
			description:
				"Filters results by annotation tag. Matches annotations carrying at least one of the given tags.",
		})
		.option("query", {
			type: "string",
			description:
				"Filters results by a free-text match on the annotation description, id, or linked entities (location, ASN, origin).",
		})
		.option("asn", {
			type: "number",
			description:
				"Filters results by Autonomous System. Specify a single Autonomous System Number (ASN) as integer.",
		})
		.option("location", {
			type: "string",
			description:
				"Filters results by location. Specify an alpha-2 location code.",
		})
		.option("geo-id", {
			type: "string",
			description:
				"Filters results by geolocation. Refer to [GeoNames](https://download.geonames.org/export/dump/readme.txt).",
		})
		.option("origin", {
			type: "string",
			description: "Filters results by origin.",
		})
		.option("tld", {
			type: "string",
			description: "Filters results by top-level domain.",
		})
		.option("ca", {
			type: "string",
			description: "Filters results by certificate authority.",
		})
		.option("log", {
			type: "string",
			description: "Filters results by certificate log.",
		})
		.option("bot", { type: "string", description: "Filters results by bot." })
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

type Query = SdkQuery<"radar-get-annotations-outages">;

const typedBuilder = withArgTypes<
	{
		"data-source": Query["dataSource"];
		"outage-type": Query["outageType"];
		"outage-cause": Query["outageCause"];
		tags: Query["tags"];
		format: Query["format"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get",
	describe: "Get latest Internet outages and anomalies",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar annotations outages get",
				classification: {
					safeFlags: [
						"data-source",
						"outage-type",
						"outage-cause",
						"format",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					limit: argv["limit"],
					offset: argv["offset"],
					dateRange: argv["date-range"],
					dateStart: argv["date-start"],
					dateEnd: argv["date-end"],
					dataSource: argv["data-source"],
					outageType: argv["outage-type"],
					outageCause: argv["outage-cause"],
					tags: argv["tags"],
					query: argv["query"],
					asn: argv["asn"],
					location: argv["location"],
					geoId: argv["geo-id"],
					origin: argv["origin"],
					tld: argv["tld"],
					ca: argv["ca"],
					log: argv["log"],
					bot: argv["bot"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar annotations outages get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/annotations/outages`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.radar.annotations.outages.get(queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
