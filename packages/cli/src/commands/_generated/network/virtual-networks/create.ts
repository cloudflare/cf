/**
 * create command
 * @generated from apis/overlays/network.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		comment: {
			kind: "parsed",
			brief: "Optional remark describing the virtual network.",
			default: "",
			parse: String,
		},
		"is-default": {
			kind: "boolean",
			brief: "If `true`, this virtual network is the default for the account.",
			optional: true,
		},
		"is-default-network": {
			kind: "boolean",
			brief: "If `true`, this virtual network is the default for the account.",
			default: false,
		},
		name: {
			kind: "parsed",
			brief: "A user-friendly name for the virtual network.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create a virtual network",
	usage:
		"$0 network virtual-networks create\n\nAdds a new virtual network to an account.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
