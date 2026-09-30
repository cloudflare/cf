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
 * list command
 * @generated from apis/overlays/radar.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 radar bgp hijacks events list\n\nRetrieves the BGP hijack events."
		)
		.option("page", {
			type: "number",
			description: "Current page number, starting from 1.",
		})
		.option("per-page", {
			type: "number",
			description: "Number of entries per page.",
		})
		.option("event-id", {
			type: "number",
			description: "The unique identifier of a event.",
		})
		.option("hijacker-asn", {
			type: "number",
			description: "The potential hijacker AS of a BGP hijack event.",
		})
		.option("victim-asn", {
			type: "number",
			description: "The potential victim AS of a BGP hijack event.",
		})
		.option("involved-asn", {
			type: "number",
			description: "The potential hijacker or victim AS of a BGP hijack event.",
		})
		.option("involved-country", {
			type: "string",
			description:
				"The country code of the potential hijacker or victim AS of a BGP hijack event.",
		})
		.option("prefix", { type: "string", description: "Prefix" })
		.option("min-confidence", {
			type: "number",
			description:
				"Filters events by minimum confidence score (1-4 low, 5-7 mid, 8+ high).",
		})
		.option("max-confidence", {
			type: "number",
			description:
				"Filters events by maximum confidence score (1-4 low, 5-7 mid, 8+ high).",
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
		.option("sort-by", {
			type: "string",
			description: "Sorts results by the specified field.",
			choices: ["ID", "TIME", "CONFIDENCE"],
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

type Query = SdkQuery<"radar-get-bgp-hijacks-events">;

const typedBuilder = withArgTypes<
	{
		prefix: Query["prefix"];
		"sort-by": Query["sortBy"];
		"sort-order": Query["sortOrder"];
		format: Query["format"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "Get BGP hijack events",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar bgp hijacks events list",
				classification: {
					safeFlags: ["sort-by", "sort-order", "format", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page: argv["page"],
					per_page: argv["per-page"],
					eventId: argv["event-id"],
					hijackerAsn: argv["hijacker-asn"],
					victimAsn: argv["victim-asn"],
					involvedAsn: argv["involved-asn"],
					involvedCountry: argv["involved-country"],
					prefix: argv["prefix"],
					minConfidence: argv["min-confidence"],
					maxConfidence: argv["max-confidence"],
					dateRange: argv["date-range"],
					dateStart: argv["date-start"],
					dateEnd: argv["date-end"],
					sortBy: argv["sort-by"],
					sortOrder: argv["sort-order"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar bgp hijacks events list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/bgp/hijacks/events`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.radar.bgp.hijacks.events.list(queryParams)
				);
				formatOutput(result, {
					successLabel: `Loaded`,
					paginationQuery: queryParams,
				});
			}
		),
};

export default command;
