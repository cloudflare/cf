/**
 * update command
 * @generated from apis/overlays/images.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		etag: {
			kind: "parsed",
			brief: "The etag field",
			optional: true,
			parse: String,
		},
		flows: {
			kind: "parsed",
			brief:
				'The flows field. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"enabled": boolean, "provider": "fastly", "type": "provider", "version": number} | {"enabled": boolean, "name": string, "transformations": [{...}], "trigger": {...}, "type": "custom"})].',
			optional: true,
			parse: String,
		},
		"config-version": {
			kind: "parsed",
			brief: "The version field",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Update transformation flows",
	usage:
		"$0 images flows update\n\nReplace the entire transformation flows configuration for a zone.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
