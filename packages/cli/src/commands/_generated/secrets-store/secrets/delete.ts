/**
 * delete command
 * @generated from apis/overlays/secrets-store.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"store-id": { kind: "parsed", brief: "Store identifier.", parse: String },
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
		{ placeholder: "secret-id", brief: "Secret identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <secret-id>",
	describe: "Delete a secret",
	usage:
		"$0 secrets-store secrets delete <secret-id>\n\nDeletes a single secret.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
