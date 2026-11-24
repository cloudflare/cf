/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "delete <document-fingerprint-id>",
	describe: "Delete a single document fingerprint.",
	usage:
		"$0 zero-trust dlp document-fingerprints delete <document-fingerprint-id>\n\nRemoves a document fingerprint from DLP configuration. Documents matching this fingerprint will no longer be detected.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
