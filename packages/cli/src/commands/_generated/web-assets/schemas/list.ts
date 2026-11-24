/**
 * list command
 * @generated from apis/overlays/web-assets.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		host: {
			kind: "parsed",
			brief: "Receive schema only for the given host(s).",
			variadic: true,
			optional: true,
			parse: String,
		},
		feature: {
			kind: "parsed",
			brief:
				"Add feature(s) to the results. The feature name that is given here corresponds to the resulting feature object. Have a look at the top-level object description for more details on the specific meaning.",
			variadic: true,
			optional: true,
			choices: [
				"thresholds",
				"parameter_schemas",
				"schema_info",
				"confidence_intervals",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"include-schema-kind": {
			kind: "parsed",
			brief: "Schema kinds to include in exported OpenAPI schemas.",
			variadic: true,
			optional: true,
			choices: ["learned"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
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
	describe: "Export web and API operations as OpenAPI schemas",
	usage:
		"$0 web-assets schemas list\n\nReturns tracked web and API operations and their feature configuration rendered as OpenAPI schemas.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
