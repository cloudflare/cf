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
			values: ["pattern", "created_at"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "The sorting direction.",
			values: ["asc", "desc"],
			optional: true,
		},
		"is-recent": {
			kind: "boolean",
			brief:
				"Filter to show only recently registered domains that are trusted to prevent triggering Suspicious or Malicious dispositions.",
			optional: true,
		},
		"is-similarity": {
			kind: "boolean",
			brief:
				"Filter to show only proximity domains (partner or approved domains with similar spelling to connected domains) that prevent Spoof dispositions.",
			optional: true,
		},
		pattern: {
			kind: "parsed",
			brief: "Pattern",
			optional: true,
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
	command: "list",
	describe: "List trusted email domains",
	usage:
		"$0 email-security trusted-domains list\n\nReturns a paginated list of trusted domain patterns. Trusted domains prevent false positives for recently registered domains and lookalike domain detections. Patterns can use regular expressions for flexible matching.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
