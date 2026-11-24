/**
 * update command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"active-timeout": {
			kind: "parsed",
			brief: "Timeout in seconds for active flows.",
			optional: true,
			parse: Number,
		},
		"collector-ip": {
			kind: "parsed",
			brief: "IPv4 address of the NetFlow collector.",
			optional: true,
			parse: String,
		},
		"collector-port": {
			kind: "parsed",
			brief: "UDP port of the NetFlow collector.",
			optional: true,
			parse: Number,
		},
		"inactive-timeout": {
			kind: "parsed",
			brief: "Timeout in seconds for inactive flows.",
			optional: true,
			parse: Number,
		},
		"sampling-rate": {
			kind: "parsed",
			brief: "Sampling rate for NetFlow records (1 = every packet).",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "site-id", brief: "Identifier", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <site-id>",
	describe: "Update NetFlow Configuration",
	usage:
		"$0 magic-transit sites netflow-config update <site-id>\n\nUpdates NetFlow configuration for a site (partial update).",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
