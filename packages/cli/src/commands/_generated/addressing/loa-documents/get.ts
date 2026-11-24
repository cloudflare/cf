/**
 * get command
 * @generated from apis/overlays/addressing.ts
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
		text: {
			kind: "boolean",
			brief:
				"Decode the response body as UTF-8 text instead of writing raw bytes",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "loa-document-id",
			brief: "Identifier for the uploaded LOA document.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <loa-document-id>",
	describe: "Download LOA Document",
	usage:
		"$0 addressing loa-documents get <loa-document-id>\n\nDownload specified LOA document under the account.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
