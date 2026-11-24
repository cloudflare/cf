import operation from "../../_operations/radar/bots/summary.js";
/**
 * summary command
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
	command: "summary <dimension>",
	describe: "Get bots HTTP requests distribution by dimension",
	usage:
		"$0 radar bots summary <dimension>\n\nRetrieves an aggregated summary of bots HTTP requests grouped by the specified dimension.",
	flags: {
		name: {
			kind: "parsed",
			brief: "Array of names used to label the series in the response.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"date-range": {
			kind: "parsed",
			brief:
				"Filters results by relative date range ending at the current time, with each value producing a separate series. Use `<n>d` for days (up to `364d`) or `<n>w` for weeks (up to `52w`). Append `control` to request the equivalent previous period for comparison: the comparison window is shifted back by the current window's length rounded up to a whole number of weeks, so it keeps the same weekday alignment and does not overlap the current window (e.g. `7dcontrol` covers days -14 to -7, `10dcontrol` covers days -24 to -14). For example, pass `7d` and `7dcontrol` to compare this week with the previous week. All series must resolve to the same duration as the main series; relative ranges (including `control`) satisfy this automatically. Use this parameter or set specific start and end dates (`dateStart` and `dateEnd` parameters).",
			variadic: true,
			optional: true,
			parse: String,
		},
		"date-start": {
			kind: "parsed",
			brief:
				"Start of the date range. Alternative to `dateRange`; provide together with `dateEnd`. When requesting comparison series, every series must resolve to the same duration as the main series. Each `dateStart`/`dateEnd` is floored to the nearest 15 minutes before evaluation, so windows whose durations match only before alignment may be rejected.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"date-end": {
			kind: "parsed",
			brief:
				"End of the date range (inclusive). Alternative to `dateRange`; provide together with `dateStart`. When requesting comparison series, every series must resolve to the same duration as the main series. Each `dateStart`/`dateEnd` is floored to the nearest 15 minutes before evaluation, so windows whose durations match only before alignment may be rejected.",
			variadic: true,
			optional: true,
			parse: String,
		},
		asn: {
			kind: "parsed",
			brief:
				"Filters results by Autonomous System. Specify one or more Autonomous System Numbers (ASNs) as a comma-separated list. Prefix with `-` to exclude ASNs from results. For example, `-174, 3356` excludes results from AS174, but includes results from AS3356.",
			variadic: true,
			optional: true,
			parse: String,
		},
		location: {
			kind: "parsed",
			brief:
				"Filters results by location. Specify a comma-separated list of alpha-2 codes. Prefix with `-` to exclude locations from results. For example, `-US,PT` excludes results from the US, but includes results from PT.",
			variadic: true,
			optional: true,
			parse: String,
		},
		continent: {
			kind: "parsed",
			brief:
				"Filters results by continent. Specify a comma-separated list of alpha-2 codes. Prefix with `-` to exclude continents from results. For example, `-EU,NA` excludes results from EU, but includes results from NA.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"limit-per-group": {
			kind: "parsed",
			brief:
				'Limits the number of objects per group to the top items within the specified time range. When item count exceeds the limit, extra items appear grouped under an "other" category. Only supported on high-cardinality dimensions; otherwise the request is rejected. Minimum value is 2.',
			optional: true,
			parse: Number,
		},
		bot: {
			kind: "parsed",
			brief: "Filters results by bot name.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"bot-operator": {
			kind: "parsed",
			brief: "Filters results by bot operator.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"bot-category": {
			kind: "parsed",
			brief:
				"Filters results by bot category. `ACCESSIBILITY`, `AGGREGATOR`, `AI_SEARCH`, `ARCHIVER`, `SOCIAL_MEDIA_MARKETING` and `WEBHOOKS` are deprecated legacy categories that match only that exact category.",
			variadic: true,
			optional: true,
			choices: [
				"ACADEMIC_RESEARCH",
				"ADVERTISING_AND_MARKETING",
				"AI_ASSISTANT",
				"AI_CRAWLER",
				"COMMERCE",
				"FEED_FETCHER",
				"MONITORING_AND_ANALYTICS",
				"OTHER",
				"PAGE_PREVIEW",
				"SEARCH_ENGINE_CRAWLER",
				"SEARCH_ENGINE_OPTIMIZATION",
				"SECURITY",
				"ACCESSIBILITY",
				"AGGREGATOR",
				"AI_SEARCH",
				"ARCHIVER",
				"SOCIAL_MEDIA_MARKETING",
				"WEBHOOKS",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"bot-kind": {
			kind: "parsed",
			brief:
				"Filters results by bot kind. Deprecated: the Verified Bot / Signed Agent distinction is being removed.",
			variadic: true,
			optional: true,
			choices: ["AGENT", "BOT"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"bot-verification-status": {
			kind: "parsed",
			brief:
				"Filters results by bot verification status (Verified vs. Unverified).",
			variadic: true,
			optional: true,
			choices: ["VERIFIED"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
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
	operands: [
		{
			placeholder: "dimension",
			brief: "Specifies the attribute by which to group the results.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar bots summary",
				classification: {
					safeFlags: ["format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					name: argv["name"],
					dateRange: argv["date-range"],
					dateStart: argv["date-start"],
					dateEnd: argv["date-end"],
					asn: argv["asn"],
					location: argv["location"],
					continent: argv["continent"],
					limitPerGroup: argv["limit-per-group"],
					bot: argv["bot"],
					botOperator: argv["bot-operator"],
					botCategory: argv["bot-category"],
					botKind: argv["bot-kind"],
					botVerificationStatus: argv["bot-verification-status"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar bots summary",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/bots/summary/${argv["dimension"] == null ? "<dimension>" : encodeURIComponent(String(argv["dimension"]))}`,
						pathParams: { dimension: String(argv["dimension"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						dimension: argv["dimension"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
