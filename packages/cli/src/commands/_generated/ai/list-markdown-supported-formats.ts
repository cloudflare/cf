/**
 * list-markdown-supported-formats command
 * @generated from apis/overlays/ai.ts
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list-markdown-supported-formats",
	describe: "List supported Markdown conversion formats",
	usage:
		"$0 ai list-markdown-supported-formats\n\nLists the file extensions and MIME types accepted by Workers AI's Markdown conversion endpoint. Use this list to check whether a file can be converted before uploading it.",
	...parameters,
	loader: () => import("./list-markdown-supported-formats.handler.js"),
});

export default command;
