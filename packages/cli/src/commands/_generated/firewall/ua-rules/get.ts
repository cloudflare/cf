/**
 * get command
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
	command: "get <ua-rule-id>",
	describe: "Get a User Agent Blocking rule",
	usage:
		"$0 firewall ua-rules get <ua-rule-id>\n\nFetches the details of a User Agent Blocking rule.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
