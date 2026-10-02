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
			"$0 radar email security top tlds malicious get <malicious>\n\nRetrieves the top TLDs by emails classified as malicious or not."
		)
		.positional("malicious", {
			type: "string",
			description: "Malicious classification.",
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
		.option("arc", {
			type: "string",
			description:
				"Filters results by ARC (Authenticated Received Chain) validation.",
		})
		.option("dkim", {
			type: "string",
			description:
				"Filters results by DKIM (DomainKeys Identified Mail) validation status.",
		})
		.option("dmarc", {
			type: "string",
			description:
				"Filters results by DMARC (Domain-based Message Authentication, Reporting and Conformance) validation status.",
		})
		.option("spf", {
			type: "string",
			description:
				"Filters results by SPF (Sender Policy Framework) validation status.",
		})
		.option("tls-version", {
			type: "string",
			description: "Filters results by TLS version.",
		})
		.option("tld-category", {
			type: "string",
			description: "Filters results by TLD category.",
			choices: ["CLASSIC", "COUNTRY"],
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

type Request = SdkRequest<"radar-get-email-security-top-tlds-by-malicious">;
type Query = SdkQuery<"radar-get-email-security-top-tlds-by-malicious">;

const typedBuilder = withArgTypes<
	{
		arc: Query["arc"];
		dkim: Query["dkim"];
		dmarc: Query["dmarc"];
		spf: Query["spf"];
		"tls-version": Query["tlsVersion"];
		"tld-category": Query["tldCategory"];
		format: Query["format"];
		malicious: Request["malicious"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <malicious>",
	describe: "Get top TLDs by email malicious classification",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar email security top tlds malicious get",
				classification: {
					safeFlags: ["tld-category", "format", "dry-run"],
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
					arc: argv["arc"],
					dkim: argv["dkim"],
					dmarc: argv["dmarc"],
					spf: argv["spf"],
					tlsVersion: argv["tls-version"],
					tldCategory: argv["tld-category"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar email security top tlds malicious get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/email/security/top/tlds/malicious/${argv["malicious"] == null ? "<malicious>" : encodeURIComponent(String(argv["malicious"]))}`,
						pathParams: { malicious: String(argv["malicious"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.radar.email.security.top.tlds.malicious.get({
						malicious: argv["malicious"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
