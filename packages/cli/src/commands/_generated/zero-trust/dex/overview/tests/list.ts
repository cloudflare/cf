/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		colo: {
			kind: "parsed",
			brief:
				"Optionally filter result stats to a Cloudflare colo. Cannot be used in combination with deviceId param.",
			optional: true,
			parse: String,
		},
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
		"registration-id": {
			kind: "parsed",
			brief:
				"Optionally filter results to a specific device registration. Must be used in combination with a single deviceId.",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number of paginated results",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of items per page",
			optional: true,
			parse: Number,
		},
		kind: {
			kind: "enum",
			brief: "Filter by test type.",
			values: ["http", "traceroute"],
			optional: true,
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
	command: "list",
	describe: "List DEX test analytics",
	usage:
		"$0 zero-trust dex overview tests list\n\nList DEX tests with overview metrics.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
