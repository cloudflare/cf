/**
 * list command
 * @generated from apis/overlays/api-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"schema-id": {
			kind: "parsed",
			brief: "The unique identifier of the schema",
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
		host: {
			kind: "parsed",
			brief: "Filter results to only include the specified hosts.",
			variadic: true,
			optional: true,
			parse: String,
		},
		method: {
			kind: "parsed",
			brief: "Filter results to only include the specified HTTP methods.",
			variadic: true,
			optional: true,
			parse: String,
		},
		endpoint: {
			kind: "parsed",
			brief:
				"Filter results to only include endpoints containing this pattern.",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Maximum number of results per page.",
			optional: true,
			parse: Number,
		},
		"operation-status": {
			kind: "enum",
			brief:
				"Filter results by whether operations exist in Web Asset Management or not. `new` will just return operations from the schema that do not exist otherwise. `existing` will just return operations from the schema that already exist.",
			values: ["new", "existing"],
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
	describe: "Retrieve all operations from the schema",
	usage:
		"$0 api-security schema-validation schemas operations list\n\nRetrieves all operations from the schema. Operations that already exist in API Shield Endpoint Management will be returned as full operations.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
