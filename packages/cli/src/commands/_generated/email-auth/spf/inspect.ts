/**
 * inspect command
 * @generated from apis/overlays/email-auth.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		id: {
			kind: "parsed",
			brief: "DNS record ID (rec_tag) to inspect",
			parse: String,
		},
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
	command: "inspect",
	describe: "Inspect SPF Record",
	usage:
		"$0 email-auth spf inspect\n\nInspects a specific SPF TXT record and returns a parsed tree structure in the spflimit-worker format. The record ID must be provided via the `id` query parameter. Returns a recursive tree showing: - Parsed components with their qualifiers and types - Nested includes recursively resolved within components - Per-component and total lookup counts - Detailed error information with context",
	...parameters,
	loader: () => import("./inspect.handler.js"),
});

export default command;
