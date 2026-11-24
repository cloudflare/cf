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
			placeholder: "lock-downs-id",
			brief: "The unique identifier of the Zone Lockdown rule.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <lock-downs-id>",
	describe: "Get a Zone Lockdown rule",
	usage:
		"$0 firewall lockdowns get <lock-downs-id>\n\nFetches the details of a Zone Lockdown rule.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
