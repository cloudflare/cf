/**
 * delete command
 * @generated from apis/overlays/containers.ts
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
		{ placeholder: "domain", brief: "The domain to delete.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <domain>",
	describe: "Delete a registry from the account",
	usage:
		"$0 containers registries delete <domain>\n\nDelete a registry from the account, this will prevent Containers from pulling images from the registry.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
