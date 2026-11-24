/**
 * get command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"test-name": {
			kind: "parsed",
			brief: "Optionally filter results by test name.",
			optional: true,
			parse: String,
		},
		"device-id": {
			kind: "parsed",
			brief:
				"Optionally filter result stats to a specific device(s). Cannot be used in combination with colo param.",
			variadic: true,
			optional: true,
			parse: String,
		},
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
	describe: "Get count of devices targeted",
	usage:
		"$0 zero-trust dex overview tests unique-devices get\n\nReturns unique count of devices that have run synthetic application monitoring tests in the past 7 days.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
