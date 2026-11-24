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
		from: {
			kind: "parsed",
			brief:
				"Start of the time range to query. Timestamp can be provided in ISO 8601 datetime format or milliseconds since epoch.",
			parse: String,
		},
		to: {
			kind: "parsed",
			brief:
				"End of the time range to query. Timestamp can be provided in ISO 8601 datetime format or milliseconds since epoch.",
			parse: String,
		},
		interval: {
			kind: "enum",
			brief: "Time interval for aggregate time slots.",
			values: ["minute", "hour"],
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
	describe: "Get the status over time for a device",
	usage:
		"$0 zero-trust dex devices over-time get <device-id>\n\nGet time-bucketed status metrics for a specific device.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
