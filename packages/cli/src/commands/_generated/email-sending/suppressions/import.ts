/**
 * import command
 * @generated from apis/overlays/email-sending.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		items: {
			kind: "parsed",
			brief:
				'Suppressions to import. Items with the same email address and scope are deduplicated before processing. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"email": string, "expires_at"?: (string | null), "note"?: string, "scope"?: {...}}]. ? marks optional keys.',
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
	command: "import",
	describe: "Bulk import account Email Sending suppressions",
	usage:
		"$0 email-sending suppressions import\n\nImports up to 1,000 Email Sending suppressions in one request. Each item applies to every sending domain of the account (default) or to one sending domain.",
	...parameters,
	loader: () => import("./import.handler.js"),
});

export default command;
