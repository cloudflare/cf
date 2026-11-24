/**
 * bulk-apply command
 * @generated from apis/overlays/email-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		deletes: {
			kind: "parsed",
			brief:
				'IDs of the URL ignore patterns to delete. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"id": string}].',
			optional: true,
			parse: String,
		},
		patches: {
			kind: "parsed",
			brief:
				'Partial updates to apply — each entry carries the pattern\'s ID and only the fields to change. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"comments"?: (string | null), "pattern"?: string} & {"id": string})]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		posts: {
			kind: "parsed",
			brief:
				'URL ignore patterns to create. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"pattern": string, "comments"?: (string | null)}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		puts: {
			kind: "parsed",
			brief:
				'Full replacements to apply — each entry carries the pattern\'s ID and every field of its new value. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"pattern": string, "comments"?: (string | null)} & {"id": string})]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "bulk-apply",
	describe: "Batch URL ignore pattern operations",
	usage:
		"$0 email-security url-ignore-patterns bulk-apply\n\nExecutes multiple operations atomically. All four operation arrays (deletes, patches, puts, posts) are required and executed in order. Send empty arrays for unused operations.",
	...parameters,
	loader: () => import("./bulk-apply.handler.js"),
});

export default command;
