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
		include: {
			kind: "parsed",
			brief:
				'Comma-separated list of additional information that should be included in the device response. Supported values are: "last_seen_registration.policy".',
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "device-id", brief: "Device ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <device-id>",
	describe: "Get device",
	usage:
		"$0 zero-trust devices get <device-id>\n\nFetches a single WARP device.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
