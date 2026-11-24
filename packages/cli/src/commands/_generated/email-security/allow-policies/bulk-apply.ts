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
				'IDs of the allow policies to delete. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"id": string}].',
			optional: true,
			parse: String,
		},
		patches: {
			kind: "parsed",
			brief:
				'Partial updates to apply — each entry carries the policy\'s ID and only the fields to change. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"comments"?: (string | null), "expires_at"?: (string | null), "is_acceptable_sender"?: boolean, "is_exempt_recipient"?: boolean, "is_recipient"?: boolean, ...more} & {"id": string})]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		posts: {
			kind: "parsed",
			brief:
				'Allow policies to create. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"is_acceptable_sender": boolean, "is_exempt_recipient": boolean, "is_regex": boolean, "is_trusted_sender": boolean, "pattern": string, ...more}].',
			optional: true,
			parse: String,
		},
		puts: {
			kind: "parsed",
			brief:
				'Full replacements to apply — each entry carries the policy\'s ID and every field of its new value. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"is_acceptable_sender": boolean, "is_exempt_recipient": boolean, "is_regex": boolean, "is_trusted_sender": boolean, "pattern": string, ...more} & {"id": string})].',
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
	describe: "Batch allow policy operations",
	usage:
		"$0 email-security allow-policies bulk-apply\n\nExecutes multiple allow policy operations atomically: delete, partially update, replace, and create allow policies in a single request. All four operation arrays (deletes, patches, puts, posts) are required and executed in order. Send empty arrays for unused operations.",
	...parameters,
	loader: () => import("./bulk-apply.handler.js"),
});

export default command;
