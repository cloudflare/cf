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
		{ placeholder: "route-id", brief: "UUID of the route.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <route-id>",
	describe: "Get tunnel route",
	usage:
		"$0 network routes cidr get <route-id>\n\nGet a private network route in an account.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
