/**
 * get command
 * @generated from apis/overlays/zones.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
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
	describe: "Get Binary AST setting",
	usage:
		"$0 zones binary-ast get\n\nBinary AST is a new binary encoding for JavaScript that enables faster parsing of scripts. When enabled, Cloudflare will serve a binary-encoded version of JavaScript to compatible browsers.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
