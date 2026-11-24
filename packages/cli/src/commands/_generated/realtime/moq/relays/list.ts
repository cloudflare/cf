/**
 * list command
 * @generated from apis/overlays/realtime.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"created-before": {
			kind: "parsed",
			brief:
				"Cursor for pagination. Returns relays created strictly before this\nRFC 3339 timestamp (typically the `created` value of the first item\non the current page, to fetch the previous page).",
			optional: true,
			parse: String,
		},
		"created-after": {
			kind: "parsed",
			brief:
				"Cursor for pagination. Returns relays created strictly after this\nRFC 3339 timestamp (typically the `created` value of the last item\non the current page, to fetch the next page).",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"Maximum number of relays to return per page. Values above the maximum are\nclamped to it rather than rejected.",
			optional: true,
			parse: Number,
		},
		asc: {
			kind: "boolean",
			brief:
				"Sort order by `created`. When true, results are returned oldest-first\n(ascending); otherwise newest-first (descending, the default).",
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
	describe: "List relays",
	usage:
		"$0 realtime moq relays list\n\nLists all MoQ relays for the account. Returns only metadata. Config, status, and tokens are omitted. Results are cursor-paginated (keyset on the `created` timestamp). Use `created_before` / `created_after` with the `created` value of the first/last item in a page to fetch the adjacent page. `result_info` reports the page `count` and the `total` matching the cursor filters.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
