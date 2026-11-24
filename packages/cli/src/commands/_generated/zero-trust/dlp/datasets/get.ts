/**
 * get command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "dataset-id", brief: "Dataset ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <dataset-id>",
	describe: "Fetch a specific dataset",
	usage:
		"$0 zero-trust dlp datasets get <dataset-id>\n\nGets a dataset and its latest upload status.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
