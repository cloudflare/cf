import { createCommandClient } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * summary command
 * @generated from apis/overlays/radar.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 radar ct summary <dimension>\n\nRetrieves an aggregated summary of certificates grouped by the specified dimension."
		)
		.positional("dimension", {
			type: "string",
			description:
				"Specifies the certificate attribute by which to group the results.",
			demandOption: true,
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
		.option("limit-per-group", {
			type: "number",
			description:
				'Limits the number of objects per group to the top items within the specified time range. When item count exceeds the limit, extra items appear grouped under an "other" category. Only supported on high-cardinality dimensions; otherwise the request is rejected. Minimum value is 2.',
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
		.option("normalization", {
			type: "string",
			description:
				"Normalization method applied to the results. Refer to [Normalization methods](https://developers.cloudflare.com/radar/concepts/normalization/).",
			choices: ["RAW_VALUES", "PERCENTAGE"],
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

type Request = SdkRequest<"radar-get-ct-summary">;
type Query = SdkQuery<"radar-get-ct-summary">;

const typedBuilder = withArgTypes<
	{
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
		normalization: Query["normalization"];
		format: Query["format"];
		dimension: Request["dimension"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "summary <dimension>",
	describe: "Get certificate distribution by dimension",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar ct summary",
				classification: {
					safeFlags: ["normalization", "format", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					name: argv["name"],
					dateRange: argv["date-range"],
					dateStart: argv["date-start"],
					dateEnd: argv["date-end"],
					limitPerGroup: argv["limit-per-group"],
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
					normalization: argv["normalization"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar ct summary",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/ct/summary/${argv["dimension"] == null ? "<dimension>" : encodeURIComponent(String(argv["dimension"]))}`,
						pathParams: { dimension: String(argv["dimension"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.radar.ct.summary({
						dimension: argv["dimension"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
