/**
 * list command
 * @generated from apis/overlays/email-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		page: {
			kind: "parsed",
			brief: "Current page within paginated list of results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "The number of results per page. Maximum value is 1000.",
			optional: true,
			parse: Number,
		},
		search: {
			kind: "parsed",
			brief: "Search term for filtering records. Behavior may change.",
			optional: true,
			parse: String,
		},
		order: {
			kind: "enum",
			brief: "Field to sort by.",
			values: ["name", "email", "created_at"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "The sorting direction.",
			values: ["asc", "desc"],
			optional: true,
		},
		provenance: {
			kind: "enum",
			brief: "Provenance",
			values: [
				"A1S_INTERNAL",
				"SNOOPY-CASB_OFFICE_365",
				"SNOOPY-OFFICE_365",
				"SNOOPY-GOOGLE_DIRECTORY",
			],
			optional: true,
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
	command: "list",
	describe: "List impersonation registry entries",
	usage:
		"$0 email-security impersonation-registry list\n\nReturns a paginated list of protected identities in the impersonation registry. These entries define identities and email addresses to protect from impersonation attacks. Can be manually added or automatically synced from directory integrations.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
