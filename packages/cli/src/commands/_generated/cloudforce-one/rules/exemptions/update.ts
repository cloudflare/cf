/**
 * update command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		namespace: {
			kind: "parsed",
			brief:
				'The namespace field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"new_pattern": string, "old_pattern": string}].',
			optional: true,
			parse: String,
		},
		"tag-match": {
			kind: "parsed",
			brief:
				'The tag_match field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"new_pattern": string, "old_pattern": string}].',
			optional: true,
			parse: String,
		},
		"worker-name": {
			kind: "parsed",
			brief:
				'The worker_name field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"new_pattern": string, "old_pattern": string}].',
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
	describe: "Update exemption rule patterns",
	usage:
		"$0 cloudforce-one rules exemptions update\n\nReplace existing exemption patterns with new values. Each key maps to an array of {old_pattern, new_pattern} entries. Missing keys leave that type untouched. Fails if any old pattern is not found or any new pattern already exists.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
