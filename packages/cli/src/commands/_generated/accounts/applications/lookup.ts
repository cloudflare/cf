/**
 * lookup command
 * @generated from apis/overlays/accounts.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		filter: {
			kind: "parsed",
			brief:
				"Filter matches using the same `key:value` filters as the list endpoint.",
			optional: true,
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief:
				"Maximum number of matches to return. Defaults to 25; values are clamped to 1–250.",
			optional: true,
			parse: Number,
		},
		fields: {
			kind: "parsed",
			brief:
				"Return only the listed properties on each application, as a comma-separated list.\nAccepts the same properties as the list endpoint. `id` is always returned.\nOmit this parameter to receive the full application object.",
			optional: true,
			parse: String,
		},
		lookup: {
			kind: "parsed",
			brief:
				"Rule sentence to search for complete application names. Leading and trailing\nwhitespace is trimmed before the length is checked. Control characters other\nthan tab and line breaks return `400`.\n",
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
	command: "lookup",
	describe: "Look up applications in a rule sentence",
	usage:
		"$0 accounts applications lookup\n\nFind complete application names mentioned in a rule sentence, ignoring case. Lookup does not correct misspellings. Matches are ranked by relevance. This endpoint takes the rule sentence in the request body, so the text stays out of URLs and request logs. Use it instead of the `lookup` query parameter on the list endpoint when the text may contain sensitive content. `fields`, `limit`, and `filter` work the same way as on the list endpoint and are passed as query parameters. Results are not paged: `offset`, `cursor`, `order_by`, `search`, and `lookup` query parameters return `400`. Unknown request body properties also return `400`. Invalid UTF-8 or a NUL character (U+0000) in any query parameter name or value returns `400`. The authenticated principal must have access to the account identified by `account_id`.",
	...parameters,
	loader: () => import("./lookup.handler.js"),
});

export default command;
