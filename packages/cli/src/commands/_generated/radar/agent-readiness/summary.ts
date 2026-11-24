/**
 * summary command
 * @generated from apis/overlays/radar.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		date: {
			kind: "parsed",
			brief: "Filters results by the specified date.",
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
		name: {
			kind: "parsed",
			brief: "Array of names used to label the series in the response.",
			variadic: true,
			optional: true,
			parse: String,
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
			brief:
				"Specifies the agent readiness data dimension by which to group the results.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "summary <dimension>",
	describe: "Get agent readiness summary",
	usage:
		"$0 radar agent-readiness summary <dimension>\n\nReturns a summary of AI agent readiness scores across scanned domains, grouped by the specified dimension. Data is sourced from weekly bulk scans. All values are raw domain counts.",
	...parameters,
	loader: () => import("./summary.handler.js"),
});

export default command;
