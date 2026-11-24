/**
 * get command
 * @generated from apis/overlays/web-assets.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
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
		"with-schemas": {
			kind: "boolean",
			brief:
				"When true, includes OpenAPI schemas (both uploaded and learned) for the operation in the response. Due to the conversion overhead, this parameter is only supported on single-operation retrieval.",
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
			placeholder: "operation-id",
			brief: "Identifier for the operation",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <operation-id>",
	describe: "Get a web or API operation",
	usage:
		"$0 web-assets operations get <operation-id>\n\nReturns a web or API operation, including its schema validation settings and requested feature data.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
