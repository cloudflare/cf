/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "cni",
			brief: "CNI ID to retrieve information about",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <cni>",
	describe: "Delete a specified CNI object",
	usage:
		"$0 network-interconnects cnis delete <cni>\n\nPermanently removes a Cloud Network Interconnect (CNI) configuration. The private network connection will be terminated.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
