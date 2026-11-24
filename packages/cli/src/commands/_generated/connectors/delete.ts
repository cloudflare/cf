/**
 * delete command
 * @generated from apis/overlays/connectors.ts
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
		{ placeholder: "connector-id", brief: "Connector ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <connector-id>",
	describe: "Delete Connector",
	usage:
		"$0 connectors delete <connector-id>\n\nDeletes a Magic WAN Connector.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
