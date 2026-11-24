/**
 * list command
 * @generated from apis/overlays/billing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		limit: {
			kind: "parsed",
			brief:
				"Maximum number of audit entries to return. Defaults to 50. Values above 100 are capped at 100 rather than rejected.",
			optional: true,
			parse: Number,
		},
		period: {
			kind: "enum",
			brief:
				"Select current subscription billing-cycle history or history across all cycles.",
			values: ["current_billing_cycle", "all"],
			optional: true,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Opaque token from the preceding response's result_info.cursor. Pass it unchanged to retrieve older entries.",
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
	describe: "List Spend Policy Activity",
	usage:
		"$0 billing spend-policies activity list\n\nReturns configuration history from immutable policy revisions for the account, including deleted policies. Entries contain before/after values and verified actor attribution. Pages use descending revision IDs, not event or commit order; refresh the first page for new entries. This cursor is not an incremental consumer checkpoint. Defaults to `period=current_billing_cycle`: each revision's timestamp must be within its product's current subscription cycle (inclusive start, exclusive end). Each product's cycle is resolved independently from canonical aggregates, including for disabled or deleted policies. Set `period=all` for history across cycles. Filtering happens before pagination. No current cycles returns an empty page; unavailable or disabled cycle resolution returns `503` with code `1013`. Cursors pin resolved cycle bounds across pages and must be used with the same period selection. Cursors obtained before this filter was introduced must be refreshed.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
