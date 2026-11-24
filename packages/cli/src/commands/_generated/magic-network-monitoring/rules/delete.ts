/**
 * delete command
 * @generated from apis/overlays/magic-network-monitoring.ts
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
			placeholder: "rule-id",
			brief: "The id of the rule. Must be unique.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <rule-id>",
	describe: "Delete rule",
	usage:
		"$0 magic-network-monitoring rules delete <rule-id>\n\nDelete a network monitoring rule for account.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
