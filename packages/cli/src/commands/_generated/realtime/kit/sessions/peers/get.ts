/**
 * get command
 * @generated from apis/overlays/realtime.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"app-id": {
			kind: "parsed",
			brief: "The app identifier tag.",
			parse: String,
		},
		filters: {
			kind: "enum",
			brief: "Filter to apply to the peer report.",
			values: [
				"device_info",
				"ip_information",
				"precall_network_information",
				"events",
				"quality_stats",
			],
			optional: true,
		},
		"include-peer-events": {
			kind: "boolean",
			brief: "if true, response includes all the peer events of participant.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "peer-id", brief: "ID of the peer", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <peer-id>",
	describe: "Fetch details of peer",
	usage:
		"$0 realtime kit sessions peers get <peer-id>\n\nReturns participant details for the given peer ID along with call statistics.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
