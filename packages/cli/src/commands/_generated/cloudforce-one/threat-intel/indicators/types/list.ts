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
				"Dataset UUIDs to query, or one standalone scope value: 'operational' for readable intelligence datasets (isAnalytics=false), 'analytics' for readable analytics datasets (isAnalytics=true), or 'all'/'*' for every readable dataset including analytics datasets. If not provided, queries all accessible datasets, including analytics datasets.",
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
	describe: "List indicator types",
	usage:
		"$0 cloudforce-one threat-intel indicators types list\n\nLists the indicator types used in the datasets given by `datasetIds`, which accepts dataset UUIDs or one scope value used alone. Without `datasetIds`, every dataset you can read is included, analytics datasets too.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
