/**
 * ases command
 * @generated from apis/overlays/radar.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		location: {
			kind: "parsed",
			brief: "Filters results by location. Specify an alpha-2 location code.",
			optional: true,
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief: "Limits the number of objects returned in the response.",
			optional: true,
			parse: Number,
		},
		"sort-by": {
			kind: "enum",
			brief: "Sorts results by the specified field.",
			values: [
				"cone",
				"pfxs",
				"ipv4",
				"ipv6",
				"rpki_valid",
				"rpki_invalid",
				"rpki_unknown",
			],
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
	command: "ases",
	describe: "List ASes from global routing tables",
	usage:
		"$0 radar bgp routes ases\n\nRetrieves all ASes in the current global routing tables with routing statistics.",
	...parameters,
	loader: () => import("./ases.handler.js"),
});

export default command;
