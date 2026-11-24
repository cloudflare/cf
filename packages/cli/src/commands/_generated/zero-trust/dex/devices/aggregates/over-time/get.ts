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
		to: {
			kind: "parsed",
			brief:
				"End of the time range to query. Timestamp can be provided in ISO 8601 datetime format or milliseconds since epoch.",
			parse: String,
		},
		from: {
			kind: "parsed",
			brief:
				"Start of the time range to query. Timestamp can be provided in ISO 8601 datetime format or milliseconds since epoch.",
			parse: String,
		},
		colo: {
			kind: "parsed",
			brief: "Cloudflare colo airport code.",
			optional: true,
			parse: String,
		},
		"device-id": {
			kind: "parsed",
			brief: "Device-specific ID, given as UUID.",
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
	describe: "Get over time aggregate details for devices by dimension",
	usage:
		"$0 zero-trust dex devices aggregates over-time get\n\nGet aggregate details for devices using WARP, up to 7 days.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
