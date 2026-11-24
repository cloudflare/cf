/**
 * list command
 * @generated from apis/overlays/intel.ts
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
	command: "list",
	describe: "Get Available IP Lists",
	usage:
		"$0 intel ip-lists list\n\nReturns a list of available IP list categories (e.g., anonymizer, botnetcc, malware, tor, vpn, open_proxies). This endpoint provides metadata about which IP lists are available in the system.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
