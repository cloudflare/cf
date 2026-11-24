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
		"command-id": {
			kind: "parsed",
			brief: "Unique identifier for command.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		text: {
			kind: "boolean",
			brief:
				"Decode the response body as UTF-8 text instead of writing raw bytes",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "filename",
			brief:
				"The name of the file to be downloaded, including the \`.zip\` extension.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <filename>",
	describe: "Download command output file",
	usage:
		"$0 zero-trust dex commands results get <filename>\n\nDownloads artifacts for an executed command. Bulk downloads are not supported",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
