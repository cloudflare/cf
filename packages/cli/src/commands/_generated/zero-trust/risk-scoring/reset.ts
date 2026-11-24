/**
 * reset command
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
	operands: [{ placeholder: "user-id", brief: "User ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "reset <user-id>",
	describe: "Clear the risk score for a particular user",
	usage:
		"$0 zero-trust risk-scoring reset <user-id>\n\nResets risk scores for specified users, clearing their accumulated risk history.",
	...parameters,
	loader: () => import("./reset.handler.js"),
});

export default command;
