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
			brief: "Device to filter traceroute result runs to.",
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
	describe: "Get network path breakdown for a traceroute test",
	usage:
		"$0 zero-trust dex tests network-path get <test-id>\n\nGet a breakdown of metrics by hop for individual traceroute test runs.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
