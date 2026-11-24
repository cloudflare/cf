/**
 * create command
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
			default: "",
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
			brief: "Attributes of the new document fingerprint.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Creates a new document fingerprint.",
	usage:
		"$0 zero-trust dlp document-fingerprints create\n\nCreates a new document fingerprint for DLP scanning. Document fingerprints detect documents that are structurally similar to the uploaded sample.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
