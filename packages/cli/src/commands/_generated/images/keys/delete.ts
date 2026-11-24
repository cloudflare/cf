/**
 * delete command
 * @generated from apis/overlays/images.ts
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
			placeholder: "signing-key-name",
			brief: "Signing key name",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <signing-key-name>",
	describe: "Delete Signing Key",
	usage:
		"$0 images keys delete <signing-key-name>\n\nDelete a CF Images signing key with specified name. Returns all keys available. When the last key is removed, a new default signing key will be generated.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
