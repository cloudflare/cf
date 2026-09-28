import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery } from "#sdk";
/**
 * timeseries command
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
		.usage("$0 radar ct timeseries\n\nRetrieves certificate volume over time.")
		.option("agg-interval", {
			type: "string",
			description:
				"Aggregation interval of the results (e.g., in 15 minutes or 1 hour intervals). Refer to [Aggregation intervals](https://developers.cloudflare.com/radar/concepts/aggregation-intervals/). When omitted, the interval is auto-selected from the requested date range; finer intervals are only available for shorter ranges. If the requested interval is too granular for the date range, the request is rejected.",
			choices: ["15m", "1h", "1d", "1w"],
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
		.option("ca", {
			type: "string",
			description: "Filters results by certificate authority.",
		})
		.option("ca-owner", {
			type: "string",
			description: "Filters results by certificate authority owner.",
		})
		.option("duration", {
			type: "string",
			description: "Filters results by certificate duration.",
		})
		.option("entry-type", {
			type: "string",
			description:
				"Filters results by entry type (certificate vs. pre-certificate). Incompatible with the `tld` filter/dimension.",
		})
		.option("expiration-status", {
			type: "string",
			description: "Filters results by expiration status (expired vs. valid).",
		})
		.option("has-ips", {
			type: "string",
			description:
				"Filters results based on whether the certificates are bound to specific IP addresses.",
		})
		.option("has-wildcards", {
			type: "string",
			description:
				"Filters results based on whether the certificates contain wildcard domains.",
		})
		.option("log", {
			type: "string",
			description:
				"Filters results by certificate log. Incompatible with the `tld` filter/dimension.",
		})
		.option("log-api", {
			type: "string",
			description:
				"Filters results by certificate log API (RFC6962 vs. static). Incompatible with the `tld` filter/dimension.",
		})
		.option("log-operator", {
			type: "string",
			description:
				"Filters results by certificate log operator. Incompatible with the `tld` filter/dimension.",
		})
		.option("public-key-algorithm", {
			type: "string",
			description: "Filters results by public key algorithm.",
		})
		.option("signature-algorithm", {
			type: "string",
			description: "Filters results by signature algorithm.",
		})
		.option("tld", {
			type: "string",
			description:
				"Filters results by top-level domain. Incompatible with the `log`, `logApi`, `logOperator`, and `entryType` filters/dimensions.",
		})
		.option("validation-level", {
			type: "string",
			description: "Filters results by validation level.",
		})
		.option("unique-entries", {
			type: "string",
			description:
				"Specifies whether to filter out duplicate certificates and pre-certificates. Set to true for unique entries only.",
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

type Query = SdkQuery<"radar-get-ct-timeseries">;

const typedBuilder = withArgTypes<
	{
		"agg-interval": Query["aggInterval"];
		duration: Query["duration"];
		"entry-type": Query["entryType"];
		"expiration-status": Query["expirationStatus"];
		"has-ips": Query["hasIps"];
		"has-wildcards": Query["hasWildcards"];
		"log-api": Query["logApi"];
		"public-key-algorithm": Query["publicKeyAlgorithm"];
		"signature-algorithm": Query["signatureAlgorithm"];
		"validation-level": Query["validationLevel"];
		"unique-entries": Query["uniqueEntries"];
		format: Query["format"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "timeseries",
	describe: "Get certificates time series",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar ct timeseries",
				classification: {
					safeFlags: ["agg-interval", "format", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					aggInterval: argv["agg-interval"],
					name: argv["name"],
					dateRange: argv["date-range"],
					dateStart: argv["date-start"],
					dateEnd: argv["date-end"],
					ca: argv["ca"],
					caOwner: argv["ca-owner"],
					duration: argv["duration"],
					entryType: argv["entry-type"],
					expirationStatus: argv["expiration-status"],
					hasIps: argv["has-ips"],
					hasWildcards: argv["has-wildcards"],
					log: argv["log"],
					logApi: argv["log-api"],
					logOperator: argv["log-operator"],
					publicKeyAlgorithm: argv["public-key-algorithm"],
					signatureAlgorithm: argv["signature-algorithm"],
					tld: argv["tld"],
					validationLevel: argv["validation-level"],
					uniqueEntries: argv["unique-entries"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar ct timeseries",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/ct/timeseries`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.radar.ct.timeseries(queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
