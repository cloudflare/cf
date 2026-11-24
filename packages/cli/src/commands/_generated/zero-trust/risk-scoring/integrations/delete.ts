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
		{ placeholder: "integration-id", brief: "Integration ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <integration-id>",
	describe: "Delete a risk score integration.",
	usage:
		"$0 zero-trust risk-scoring integrations delete <integration-id>\n\nRemoves a Zero Trust risk score integration, disconnecting the external risk signal source.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
