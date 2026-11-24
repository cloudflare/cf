/**
 * update command
 * @generated from apis/overlays/snippets.ts
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
				'Lists snippet rules. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"expression": string, "snippet_name": string, "description"?: string, "enabled"?: boolean}]. ? marks optional keys.',
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
			brief: "Define a snippet rules object.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Update zone snippet rules",
	usage:
		"$0 snippets rules update\n\nUpdates all snippet rules belonging to the zone.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
