import operation from "../../../../_operations/radar/bgp/hijacks/events/list.js";
/**
 * list command
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
	command: "list",
	describe: "Get BGP hijack events",
	usage: "$0 radar bgp hijacks events list\n\nRetrieves the BGP hijack events.",
	flags: {
		page: {
			kind: "parsed",
			brief: "Current page number, starting from 1.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of entries per page.",
			optional: true,
			parse: Number,
		},
		"event-id": {
			kind: "parsed",
			brief: "The unique identifier of a event.",
			optional: true,
			parse: Number,
		},
		"hijacker-asn": {
			kind: "parsed",
			brief: "The potential hijacker AS of a BGP hijack event.",
			optional: true,
			parse: Number,
		},
		"victim-asn": {
			kind: "parsed",
			brief: "The potential victim AS of a BGP hijack event.",
			optional: true,
			parse: Number,
		},
		"involved-asn": {
			kind: "parsed",
			brief: "The potential hijacker or victim AS of a BGP hijack event.",
			optional: true,
			parse: Number,
		},
		"involved-country": {
			kind: "parsed",
			brief:
				"The country code of the potential hijacker or victim AS of a BGP hijack event.",
			optional: true,
			parse: String,
		},
		prefix: { kind: "parsed", brief: "Prefix", optional: true, parse: String },
		"min-confidence": {
			kind: "parsed",
			brief:
				"Filters events by minimum confidence score (1-4 low, 5-7 mid, 8+ high).",
			optional: true,
			parse: Number,
		},
		"max-confidence": {
			kind: "parsed",
			brief:
				"Filters events by maximum confidence score (1-4 low, 5-7 mid, 8+ high).",
			optional: true,
			parse: Number,
		},
		"date-range": {
			kind: "parsed",
			brief:
				"Filters results by a relative date range ending at the current time. Use `<n>d` for days (up to `364d`) or `<n>w` for weeks (up to `52w`), e.g. `7d`. Append `control` to request the equivalent previous period for comparison: the comparison window is shifted back by the current window's length rounded up to a whole number of weeks, so it keeps the same weekday alignment and does not overlap the current window (e.g. `3dcontrol` covers days -10 to -7, `7dcontrol` covers days -14 to -7, `28dcontrol` covers days -56 to -28, and `10dcontrol` covers days -24 to -14). Mutually exclusive with `dateStart`/`dateEnd`.",
			optional: true,
			parse: String,
		},
		"date-start": {
			kind: "parsed",
			brief:
				"Start of the date range (inclusive). Alternative to `dateRange`; provide together with `dateEnd`.",
			optional: true,
			parse: String,
		},
		"date-end": {
			kind: "parsed",
			brief:
				"End of the date range (inclusive). Alternative to `dateRange`; provide together with `dateStart`.",
			optional: true,
			parse: String,
		},
		"sort-by": {
			kind: "enum",
			brief: "Sorts results by the specified field.",
			values: ["ID", "TIME", "CONFIDENCE"],
			optional: true,
		},
		"sort-order": {
			kind: "enum",
			brief: "Sort order.",
			values: ["ASC", "DESC"],
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
				command: "radar bgp hijacks events list",
				classification: {
					safeFlags: ["sort-by", "sort-order", "format", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
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
					client.send(operation, queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
