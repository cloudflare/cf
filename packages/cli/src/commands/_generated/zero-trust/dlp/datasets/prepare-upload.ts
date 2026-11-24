/**
 * prepare-upload command
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
	command: "prepare-upload <dataset-id>",
	describe: "Prepare to upload a new version of a dataset",
	usage:
		"$0 zero-trust dlp datasets prepare-upload <dataset-id>\n\nCreates a new version of a DLP dataset, allowing you to stage changes before activation. Used for single-column EDM and custom word lists.",
	...parameters,
	loader: () => import("./prepare-upload.handler.js"),
});

export default command;
