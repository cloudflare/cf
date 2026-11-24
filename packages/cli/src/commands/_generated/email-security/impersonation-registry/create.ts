/**
 * create command
 * @generated from apis/overlays/email-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		comments: {
			kind: "parsed",
			brief: "Optional note describing the entry.",
			optional: true,
			parse: String,
		},
		"directory-id": {
			kind: "parsed",
			brief:
				"Identifier of the directory the entry was synced from, when directory-synced.",
			optional: true,
			parse: Number,
		},
		"directory-node-id": {
			kind: "parsed",
			brief:
				"Identifier of the directory node the entry was synced from, when directory-synced.",
			optional: true,
			parse: Number,
		},
		email: {
			kind: "parsed",
			brief: "Email address (or pattern) of the protected identity.",
			optional: true,
			parse: String,
		},
		"external-directory-node-id": {
			kind: "parsed",
			brief: "Deprecated. External identifier of the directory node.",
			optional: true,
			parse: String,
		},
		"is-email-regex": {
			kind: "boolean",
			brief:
				"Whether `email` is a regular expression instead of a literal address.",
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "Display name of the protected identity.",
			optional: true,
			parse: String,
		},
		provenance: {
			kind: "parsed",
			brief: "Source the entry was created from.",
			optional: true,
			choices: [
				"A1S_INTERNAL",
				"SNOOPY-CASB_OFFICE_365",
				"SNOOPY-OFFICE_365",
				"SNOOPY-GOOGLE_DIRECTORY",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "provenance", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Create an impersonation registry entry.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create impersonation registry entry",
	usage:
		"$0 email-security impersonation-registry create\n\nCreates a new entry in the impersonation registry to protect against impersonation. Emails attempting to impersonate this identity will be flagged. Supports regex patterns for flexible email matching.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
