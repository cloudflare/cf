/**
 * update command
 * @generated from apis/overlays/dns.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"auto-refresh-seconds": {
			kind: "parsed",
			brief:
				"How often should a secondary zone auto refresh regardless of DNS NOTIFY.\nNot applicable for primary zones.",
			optional: true,
			parse: Number,
		},
		name: {
			kind: "parsed",
			brief: "Zone name.",
			optional: true,
			parse: String,
		},
		peers: {
			kind: "parsed",
			brief: "A list of peer tags.",
			variadic: true,
			optional: true,
			parse: String,
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Update Secondary Zone Configuration",
	usage:
		"$0 dns zone-transfers incoming update\n\nUpdate secondary zone configuration for incoming zone transfers.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
