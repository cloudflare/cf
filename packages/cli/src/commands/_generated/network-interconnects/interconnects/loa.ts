/**
 * loa command
 * @generated from apis/overlays/network-interconnects.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		name: {
			kind: "parsed",
			brief:
				"Custom name to use in the LOA instead of the account name (200 Character limit)",
			optional: true,
			parse: String,
		},
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
	command: "loa <icon>",
	describe:
		"Generate the Letter of Authorization (LOA) for a given interconnect",
	usage:
		"$0 network-interconnects interconnects loa <icon>\n\nDownloads the Letter of Authorization (LOA) for a network interconnect, required for physical cross-connect provisioning.",
	...parameters,
	loader: () => import("./loa.handler.js"),
});

export default command;
