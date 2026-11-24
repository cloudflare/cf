/**
 * loa-default-name command
 * @generated from apis/overlays/network-interconnects.ts
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
			placeholder: "icon",
			brief: "Interconnect name to retrieve information about",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "loa-default-name <icon>",
	describe: "Get the default customer name for LOA generation",
	usage:
		"$0 network-interconnects interconnects loa-default-name <icon>\n\nRetrieves the default customer name that will be used in the LOA if no name is provided to the `/accounts/{account_id}/cni/interconnects/{icon}/loa` endpoint.",
	...parameters,
	loader: () => import("./loa-default-name.handler.js"),
});

export default command;
