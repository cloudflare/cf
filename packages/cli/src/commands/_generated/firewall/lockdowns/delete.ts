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
			placeholder: "lock-downs-id",
			brief: "The unique identifier of the Zone Lockdown rule.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <lock-downs-id>",
	describe: "Delete a Zone Lockdown rule",
	usage:
		"$0 firewall lockdowns delete <lock-downs-id>\n\nDeletes an existing Zone Lockdown rule.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
