/**
 * edit command
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
	command: "edit <rule-id>",
	describe: "Update advertisement for rule",
	usage:
		"$0 magic-network-monitoring rules advertisements edit <rule-id>\n\nUpdate advertisement for rule.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
