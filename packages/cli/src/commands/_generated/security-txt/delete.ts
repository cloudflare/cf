/**
 * delete command
 * @generated from apis/overlays/security-txt.ts
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete",
	describe: "Deletes security.txt",
	usage:
		"$0 security-txt delete\n\nRemoves the security.txt file configuration for a zone. The /.well-known/security.txt endpoint will no longer be served.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
