/**
 * delete command
 * @generated from apis/overlays/client-side-security.ts
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
	operands: [{ placeholder: "policy-id", brief: "Identifier", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <policy-id>",
	describe: "Delete a content security rule",
	usage:
		"$0 client-side-security policies delete <policy-id>\n\nPermanently deletes a content security rule by ID.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
