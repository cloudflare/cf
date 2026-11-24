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
			brief: "Start time for the query in ISO (RFC3339 - ISO 8601) format.",
			parse: String,
		},
		to: {
			kind: "parsed",
			brief: "End time for the query in ISO (RFC3339 - ISO 8601) format.",
			parse: String,
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
	describe: "Get percentiles for a traceroute test",
	usage:
		"$0 zero-trust dex test-results traceroute percentiles get <test-id>\n\nGet percentiles for a traceroute test for a given time period between 1 hour and 7 days.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
