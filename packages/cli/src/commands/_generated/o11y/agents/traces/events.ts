/**
 * events command
 * @generated from apis/overlays/o11y.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		from: {
			kind: "parsed",
			brief:
				"Optional. Narrows the search, which by default covers the full 7-day retention, so any retained Trace ID can be fetched without a window. Start as Unix epoch milliseconds; the effective value is in result_info.from.",
			optional: true,
			parse: Number,
		},
		to: {
			kind: "parsed",
			brief:
				"Optional. Narrows the search; end as Unix epoch milliseconds. Defaults to now.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Maximum items to return per page. Defaults to 100.",
			optional: true,
			parse: Number,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Opaque cursor from result_info.cursors.after in the previous response. Send it with the same filters; its window replaces from and to.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "trace-id",
			brief: "Trace ID: 32 hexadecimal characters, matched case-insensitively.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "events <traceId>",
	describe: "List Agent Trace events",
	usage:
		"$0 o11y agents traces events <traceId>\n\nReturns a page of a Trace's Agent spans (invoke_agent, chat, execute_tool) and their events, newest first. Trace and span IDs are the same as in the Worker's trace, and each span's parentSpanId links it into the Agent tree. Searches the full 7-day retention unless from or to narrow it. Continue with result_info.cursors.after; one page may not hold the whole tree.",
	...parameters,
	loader: () => import("./events.handler.js"),
});

export default command;
