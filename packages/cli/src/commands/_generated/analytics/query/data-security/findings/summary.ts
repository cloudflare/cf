/**
 * summary command
 * @generated from apis/overlays/analytics.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		filters: {
			kind: "parsed",
			brief:
				'Filters to apply. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"name": string, "op": string, "values": [(string | boolean | number)]}].',
			optional: true,
			parse: String,
		},
		from: {
			kind: "parsed",
			brief: "Start of the query time range (inclusive). RFC3339.",
			optional: true,
			parse: String,
		},
		to: {
			kind: "parsed",
			brief: "End of the query time range (exclusive). RFC3339.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Query for aggregate findings summary.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "summary",
	describe: "Data security findings summary",
	usage:
		"$0 analytics query data-security findings summary\n\nReturns aggregate current-period and previous-period totals for CASB findings.",
	...parameters,
	loader: () => import("./summary.handler.js"),
});

export default command;
