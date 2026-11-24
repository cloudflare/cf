/**
 * get-configuration command
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
	command: "get-configuration",
	describe: "Get pay-per-use zone configuration",
	usage:
		"$0 pay-per-use zones get-configuration\n\nGets the pay-per-use configuration, zone-level grace period, and read-only non-billable classification timestamp for a zone.",
	...parameters,
	loader: () => import("./get-configuration.handler.js"),
});

export default command;
