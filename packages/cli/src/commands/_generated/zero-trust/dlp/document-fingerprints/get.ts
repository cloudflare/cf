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
	operands: [
		{
			placeholder: "document-fingerprint-id",
			brief: "Document fingerprint ID",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <document-fingerprint-id>",
	describe: "Retrieve data about a specific document fingerprint.",
	usage:
		"$0 zero-trust dlp document-fingerprints get <document-fingerprint-id>\n\nGets a document fingerprint and its latest upload status.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
