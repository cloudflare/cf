/**
 * get command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dataset-id": { kind: "parsed", brief: "Dataset ID.", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "indicator-id", brief: "Indicator UUID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <indicator-id>",
	describe: "Get an indicator",
	usage:
		"$0 cloudforce-one threat-intel indicators get <indicator-id>\n\nReturns an indicator by its UUID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
