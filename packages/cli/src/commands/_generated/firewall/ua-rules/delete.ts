/**
 * delete command
 * @generated from apis/overlays/firewall.ts
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
			placeholder: "ua-rule-id",
			brief: "The unique identifier of the User Agent Blocking rule.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <ua-rule-id>",
	describe: "Delete a User Agent Blocking rule",
	usage:
		"$0 firewall ua-rules delete <ua-rule-id>\n\nDeletes an existing User Agent Blocking rule.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
