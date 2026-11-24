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
	operands: [{ placeholder: "id", brief: "Integration ID.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <id>",
	describe: "Delete integration",
	usage:
		"$0 zero-trust casb integrations delete <id>\n\nDelete an integration by soft-deleting it.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
