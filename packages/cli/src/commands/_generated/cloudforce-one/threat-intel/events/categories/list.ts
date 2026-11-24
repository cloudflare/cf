/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dataset-ids": {
			kind: "parsed",
			brief:
				"Array of dataset IDs to query categories from. If not provided, uses the default dataset.",
			variadic: true,
			optional: true,
			parse: String,
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
	describe: "List event categories used in datasets",
	usage:
		"$0 cloudforce-one threat-intel events categories list\n\nLists the event categories used by events in the datasets given by `datasetIds`, or in the default dataset when `datasetIds` is omitted. Dataset scope values are not supported. To list every category, use `threat-intel events categories catalog list`.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
