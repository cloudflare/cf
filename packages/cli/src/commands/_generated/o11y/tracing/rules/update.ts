/**
 * update command
 * @generated from apis/overlays/o11y.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		rules: {
			kind: "parsed",
			brief:
				'Trace rules in evaluation order. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"action": "set_trace_settings", "action_parameters": {...}, "description": string, "enabled": boolean, "expression": string}].',
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
			brief: "Replace the ordered trace rules",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Replace zone trace rules",
	usage:
		"$0 o11y tracing rules update\n\nReplace all sampling overrides in a zone's managed Cloudflare Traces ruleset. Rules are evaluated in the supplied order.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
