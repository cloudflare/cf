/**
 * list command
 * @generated from apis/overlays/radar.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
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
		"leak-asn": {
			kind: "parsed",
			brief: "The leaking AS of a route leak event.",
			optional: true,
			parse: Number,
		},
		"involved-asn": {
			kind: "parsed",
			brief: "ASN that is causing or affected by a route leak event.",
			optional: true,
			parse: Number,
		},
		"involved-country": {
			kind: "parsed",
			brief: "Country code of a involved ASN in a route leak event.",
			optional: true,
			parse: String,
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
			values: ["ID", "LEAKS", "PEERS", "PREFIXES", "ORIGINS", "TIME"],
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
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "Get BGP route leak events",
	usage:
		"$0 radar bgp leaks events list\n\nRetrieves the BGP route leak events.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
