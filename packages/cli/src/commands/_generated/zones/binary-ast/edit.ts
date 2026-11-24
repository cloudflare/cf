/**
 * edit command
 * @generated from apis/overlays/zones.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		value: {
			kind: "parsed",
			brief:
				'Controls Binary AST behavior:\n- "off": Feature disabled.\n- "on": Binary AST enabled.\n- "latest": Binary AST enabled using the latest version.\n',
			optional: true,
			choices: ["off", "on", "latest"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "value", "text"),
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
	command: "edit",
	describe: "Change Binary AST setting",
	usage:
		"$0 zones binary-ast edit\n\nBinary AST is a new binary encoding for JavaScript that enables faster parsing of scripts. When enabled, Cloudflare will serve a binary-encoded version of JavaScript to compatible browsers.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
