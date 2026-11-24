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
		"device-id": {
			kind: "parsed",
			brief:
				"Optionally filter result stats to a specific device(s). Cannot be used in combination with colo param.",
			variadic: true,
			optional: true,
			parse: String,
		},
		from: {
			kind: "parsed",
			brief: "Start time for aggregate metrics in ISO ms.",
			parse: String,
		},
		to: {
			kind: "parsed",
			brief: "End time for aggregate metrics in ISO ms.",
			parse: String,
		},
		interval: {
			kind: "enum",
			brief: "Time interval for aggregate time slots.",
			values: ["minute", "hour"],
		},
		colo: {
			kind: "parsed",
			brief:
				"Optionally filter result stats to a Cloudflare colo. Cannot be used in combination with deviceId param.",
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
			placeholder: "test-id",
			brief: "Unique identifier for a specific test.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <test-id>",
	describe: "Get details and aggregate metrics for an http test",
	usage:
		"$0 zero-trust dex test-results http get <test-id>\n\nGet test details and aggregate performance metrics for an http test for a given time period between 1 hour and 7 days.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
