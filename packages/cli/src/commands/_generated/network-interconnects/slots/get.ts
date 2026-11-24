/**
 * get command
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
	operands: [{ placeholder: "slot", brief: "Slot", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <slot>",
	describe: "Get information about the specified slot",
	usage:
		"$0 network-interconnects slots get <slot>\n\nGets information about a specific infrastructure slot allocation.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
