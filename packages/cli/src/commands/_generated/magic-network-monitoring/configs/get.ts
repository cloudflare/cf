/**
 * get command
 * @generated from apis/overlays/magic-network-monitoring.ts
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get",
	describe: "List account configuration",
	usage:
		"$0 magic-network-monitoring configs get\n\nLists default sampling, router IPs and warp devices for account.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
