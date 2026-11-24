/**
 * get command
 * @generated from apis/overlays/email-routing.ts
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
			placeholder: "destination-address-identifier",
			brief: "Destination address identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <destination-address-identifier>",
	describe: "Get a destination address",
	usage:
		"$0 email-routing addresses get <destination-address-identifier>\n\nGets information for a specific destination email already created.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
