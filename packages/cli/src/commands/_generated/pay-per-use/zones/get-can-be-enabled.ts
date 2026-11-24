/**
 * get-can-be-enabled command
 * @generated from apis/overlays/pay-per-use.ts
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
	command: "get-can-be-enabled",
	describe: "Get pay-per-use zone eligibility",
	usage:
		"$0 pay-per-use zones get-can-be-enabled\n\nGets whether pay-per-use can be enabled for a zone and the current zone-level grace period.",
	...parameters,
	loader: () => import("./get-can-be-enabled.handler.js"),
});

export default command;
