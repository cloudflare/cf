/**
 * get command
 * @generated from apis/overlays/addressing.ts
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
			placeholder: "address-map-id",
			brief: "Identifier of an Address Map.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <address-map-id>",
	describe: "Address Map Details",
	usage:
		"$0 addressing address-maps get <address-map-id>\n\nShow a particular address map owned by the account.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
