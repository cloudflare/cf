/**
 * get command
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
	command: "get <rule-id>",
	describe: "Get rule",
	usage:
		"$0 magic-network-monitoring rules get <rule-id>\n\nList a single network monitoring rule for account.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
