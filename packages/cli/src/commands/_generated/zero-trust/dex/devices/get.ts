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
		"since-minutes": {
			kind: "parsed",
			brief: "Number of minutes before current time.",
			parse: Number,
		},
		"time-now": {
			kind: "parsed",
			brief: "Current time in ISO format.",
			optional: true,
			parse: String,
		},
		colo: {
			kind: "parsed",
			brief: "List of data centers to filter results.",
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
			placeholder: "device-id",
			brief: "Device-specific ID, given as UUID.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <device-id>",
	describe: "Get the latest status of a device.",
	usage:
		"$0 zero-trust dex devices get <device-id>\n\nGet the latest status of a device given device_id from the device_state table.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
