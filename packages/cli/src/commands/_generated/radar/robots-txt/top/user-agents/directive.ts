/**
 * directive command
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
		name: {
			kind: "parsed",
			brief: "Array of names used to label the series in the response.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"user-agent-category": {
			kind: "enum",
			brief: "Filters results by user agent category.",
			values: ["AI"],
			optional: true,
		},
		date: {
			kind: "parsed",
			brief: "Filters results by the specified array of dates.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"domain-category": {
			kind: "parsed",
			brief: "Filters results by domain category.",
			variadic: true,
			optional: true,
			parse: String,
		},
		directive: {
			kind: "enum",
			brief: "Filters results by robots.txt directive.",
			values: ["ALLOW", "DISALLOW"],
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
	command: "directive",
	describe: "Get top user agents on robots.txt files",
	usage:
		"$0 radar robots-txt top user-agents directive\n\nRetrieves the top user agents on robots.txt files.",
	...parameters,
	loader: () => import("./directive.handler.js"),
});

export default command;
