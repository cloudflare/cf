/**
 * bulk-edit command
 * @generated from apis/overlays/workers.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		worker: {
			kind: "parsed",
			brief: "Name of the script.",
			optional: true,
			alias: ["script-name", "worker-id"],
			parse: String,
		},
		secrets: {
			kind: "parsed",
			brief:
				'Map of secret names to secret values:\n- Set to a secret object to create or update.\n- Set to `null` to delete.\n- Omit to leave unchanged. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"version-tags": {
			kind: "parsed",
			brief:
				'Optional version tags to apply to the new script version. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
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
			brief:
				"JSON Merge Patch (RFC 7396) request body for bulk secret changes. ",
			optional: true,
			parse: String,
		},
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "bulk-edit",
	describe: "Patch multiple Worker script secrets",
	usage:
		"$0 workers secrets bulk-edit\n\nCreate, update, or delete multiple secrets on a Worker script in a single operation using JSON Merge Patch (RFC 7396). This operation creates a single version with all changes included. Prefer this API instead of changing many secrets individually. Usage: - To create or update a secret, set its value to a secret object. - To delete a secret, set its value to `null`. - Secrets not included in the request are left unchanged.",
	...parameters,
	loader: () => import("./bulk-edit.handler.js"),
});

export default command;
