/**
 * top-n command
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
				'Filters to apply. `findingType = content` is applied automatically for CASB data. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"name": string, "op": string, "values": [(string | boolean | number)]}].',
			optional: true,
			parse: String,
		},
		from: {
			kind: "parsed",
			brief: "Start of the query time range (inclusive). RFC3339.",
			optional: true,
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief: "Maximum number of integrations to return.",
			optional: true,
			parse: Number,
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
			brief: "Returns the top N integrations for content findings.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "top-n",
	describe: "Top integrations by content findings",
	usage:
		"$0 analytics query data-security content-findings top-n\n\nReturns the top N integrations ranked by total content findings.",
	...parameters,
	loader: () => import("./top-n.handler.js"),
});

export default command;
