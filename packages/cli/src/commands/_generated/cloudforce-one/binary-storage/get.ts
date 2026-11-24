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
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "hash", brief: "hash of the binary", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <hash>",
	describe: "Retrieves a file from Binary Storage",
	usage:
		"$0 cloudforce-one binary-storage get <hash>\n\nRetrieves a binary file from the Cloudforce One binary storage for analysis.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
