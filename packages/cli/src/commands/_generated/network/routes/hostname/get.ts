/**
 * get command
 * @generated from apis/overlays/network.ts
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
			placeholder: "hostname-route-id",
			brief: "The hostname route ID.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <hostname-route-id>",
	describe: "Get hostname route",
	usage:
		"$0 network routes hostname get <hostname-route-id>\n\nGet a hostname route.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
