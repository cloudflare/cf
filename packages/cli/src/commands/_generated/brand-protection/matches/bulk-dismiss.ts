/**
 * bulk-dismiss command
 * @generated from apis/overlays/brand-protection.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		action: {
			kind: "parsed",
			brief:
				"`dismiss` to dismiss the matches, or `undismiss` to restore them.",
			optional: true,
			choices: ["dismiss", "undismiss"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "action", "text"),
		},
		"match-ids": {
			kind: "parsed",
			brief:
				"Legacy format; prefer `matches`. Match IDs to update. Each ID changes the match for every query that shares it, not just one query. 1 to 100 items; duplicate IDs are rejected.",
			variadic: true,
			optional: true,
			parse: String,
		},
		matches: {
			kind: "parsed",
			brief:
				'Matches to update, as (`query_id`, `domain_id`) pairs. Each pair changes the match for that query only. 1 to 100 items; duplicate pairs are rejected. Send only one format. If both are supplied, `match_ids` takes precedence and `matches` is ignored. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"domain_id": number, "query_id": number}].',
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
	command: "bulk-dismiss",
	describe: "Bulk dismiss or undismiss matches",
	usage:
		"$0 brand-protection matches bulk-dismiss\n\nDismisses or undismisses up to 100 domain matches in one request and returns a result for each item. Send `matches` as (`query_id`, `domain_id`) pairs to change each match for one query. The legacy `match_ids` format is still accepted, but it changes each match for every query that shares it; prefer `matches`.",
	...parameters,
	loader: () => import("./bulk-dismiss.handler.js"),
});

export default command;
