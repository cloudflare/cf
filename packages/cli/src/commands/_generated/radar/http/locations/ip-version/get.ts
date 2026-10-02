import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
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
			"$0 radar http locations ip-version get <ip-version>\n\nRetrieves the top locations, by HTTP requests, of the requested IP version."
		)
		.positional("ip-version", {
			type: "string",
			description: "IP version.",
			demandOption: true,
		})
		.option("limit", {
			type: "number",
			description: "Limits the number of objects returned in the response.",
		})
		.option("name", {
			type: "string",
			description: "Array of names used to label the series in the response.",
		})
		.option("date-range", {
			type: "string",
			description:
				"Filters results by relative date range ending at the current time, with each value producing a separate series. Use `<n>d` for days (up to `364d`) or `<n>w` for weeks (up to `52w`). Append `control` to request the equivalent previous period for comparison: the comparison window is shifted back by the current window's length rounded up to a whole number of weeks, so it keeps the same weekday alignment and does not overlap the current window (e.g. `7dcontrol` covers days -14 to -7, `10dcontrol` covers days -24 to -14). For example, pass `7d` and `7dcontrol` to compare this week with the previous week. All series must resolve to the same duration as the main series; relative ranges (including `control`) satisfy this automatically. Use this parameter or set specific start and end dates (`dateStart` and `dateEnd` parameters).",
		})
		.option("date-start", {
			type: "string",
			description:
				"Start of the date range. Alternative to `dateRange`; provide together with `dateEnd`. When requesting comparison series, every series must resolve to the same duration as the main series. Each `dateStart`/`dateEnd` is floored to the nearest 15 minutes before evaluation, so windows whose durations match only before alignment may be rejected.",
		})
		.option("date-end", {
			type: "string",
			description:
				"End of the date range (inclusive). Alternative to `dateRange`; provide together with `dateStart`. When requesting comparison series, every series must resolve to the same duration as the main series. Each `dateStart`/`dateEnd` is floored to the nearest 15 minutes before evaluation, so windows whose durations match only before alignment may be rejected.",
		})
		.option("asn", {
			type: "string",
			description:
				"Filters results by Autonomous System. Specify one or more Autonomous System Numbers (ASNs) as a comma-separated list. Prefix with `-` to exclude ASNs from results. For example, `-174, 3356` excludes results from AS174, but includes results from AS3356.",
		})
		.option("location", {
			type: "string",
			description:
				"Filters results by location. Specify a comma-separated list of alpha-2 codes. Prefix with `-` to exclude locations from results. For example, `-US,PT` excludes results from the US, but includes results from PT.",
		})
		.option("continent", {
			type: "string",
			description:
				"Filters results by continent. Specify a comma-separated list of alpha-2 codes. Prefix with `-` to exclude continents from results. For example, `-EU,NA` excludes results from EU, but includes results from NA.",
		})
		.option("geo-id", {
			type: "string",
			description:
				"Filters results by Geolocation. Specify a comma-separated list of GeoNames IDs. Prefix with `-` to exclude geoIds from results. For example, `-2267056,360689` excludes results from the 2267056 (Lisbon), but includes results from 5128638 (New York).",
		})
		.option("bot-class", {
			type: "string",
			description:
				"Filters results by bot class. Refer to [Bot classes](https://developers.cloudflare.com/radar/concepts/bot-classes/).",
		})
		.option("device-type", {
			type: "string",
			description: "Filters results by device type.",
		})
		.option("http-protocol", {
			type: "string",
			description: "Filters results by HTTP protocol (HTTP vs. HTTPS).",
		})
		.option("http-version", {
			type: "string",
			description: "Filters results by HTTP version.",
		})
		.option("os", {
			type: "string",
			description: "Filters results by operating system.",
		})
		.option("tls-version", {
			type: "string",
			description: "Filters results by TLS version.",
		})
		.option("browser-family", {
			type: "string",
			description: "Filters results by browser family.",
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

type Request = SdkRequest<"radar-get-http-top-locations-by-ip-version">;
type Query = SdkQuery<"radar-get-http-top-locations-by-ip-version">;

const typedBuilder = withArgTypes<
	{
		"bot-class": Query["botClass"];
		"device-type": Query["deviceType"];
		"http-protocol": Query["httpProtocol"];
		"http-version": Query["httpVersion"];
		os: Query["os"];
		"tls-version": Query["tlsVersion"];
		"browser-family": Query["browserFamily"];
		format: Query["format"];
		"ip-version": Request["ip_version"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <ip-version>",
	describe: "Get top locations by HTTP requests for an IP version",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar http locations ip-version get",
				classification: {
					safeFlags: ["format", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					limit: argv["limit"],
					name: argv["name"],
					dateRange: argv["date-range"],
					dateStart: argv["date-start"],
					dateEnd: argv["date-end"],
					asn: argv["asn"],
					location: argv["location"],
					continent: argv["continent"],
					geoId: argv["geo-id"],
					botClass: argv["bot-class"],
					deviceType: argv["device-type"],
					httpProtocol: argv["http-protocol"],
					httpVersion: argv["http-version"],
					os: argv["os"],
					tlsVersion: argv["tls-version"],
					browserFamily: argv["browser-family"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar http locations ip-version get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/http/top/locations/ip_version/${argv["ip-version"] == null ? "<ip-version>" : encodeURIComponent(String(argv["ip-version"]))}`,
						pathParams: { "ip-version": String(argv["ip-version"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.radar.http.locations.ipVersion.get({
						ip_version: argv["ip-version"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
