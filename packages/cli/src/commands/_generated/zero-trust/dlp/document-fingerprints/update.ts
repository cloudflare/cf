/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		"match-percent": {
			kind: "parsed",
			brief: "The match_percent field",
			optional: true,
			parse: Number,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Attributes of the document fingerprint to update.",
			optional: true,
			parse: String,
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
	command: "update <document-fingerprint-id>",
	describe: "Update the attributes of a single document fingerprint.",
	usage:
		"$0 zero-trust dlp document-fingerprints update <document-fingerprint-id>\n\nUpdates metadata for an existing document fingerprint, such as its name or description.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
