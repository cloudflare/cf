/**
 * get command
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
	command: "get <traceId>",
	describe: "Get an Agent Trace",
	usage:
		"$0 o11y agents traces get <traceId>\n\nReturns the summary of one Trace with Agent activity, with the same fields as the Trace list. Searches the full 7-day retention unless from or to narrow it. List the Trace's Agent spans with /agents/traces/{traceId}/events.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
