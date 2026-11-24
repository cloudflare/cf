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
		limit: {
			kind: "parsed",
			brief: "Limits the number of objects returned in the response.",
			optional: true,
			parse: Number,
		},
		offset: {
			kind: "parsed",
			brief:
				"Skips the specified number of objects before fetching the results.",
			optional: true,
			parse: Number,
		},
		location: {
			kind: "parsed",
			brief:
				"Filters results by location. Specify a comma-separated list of alpha-2 location codes.",
			optional: true,
			parse: String,
		},
		region: {
			kind: "parsed",
			brief: "Filters results by region.",
			optional: true,
			parse: String,
		},
		subregion: {
			kind: "parsed",
			brief: "Filters results by subregion.",
			optional: true,
			parse: String,
		},
		continent: {
			kind: "enum",
			brief: "Filters results by continent code.",
			values: ["AF", "AS", "EU", "NA", "OC", "SA"],
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
	describe: "List locations",
	usage: "$0 radar entities locations list\n\nRetrieves a list of locations.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
