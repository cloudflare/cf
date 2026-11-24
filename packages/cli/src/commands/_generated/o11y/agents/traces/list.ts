/**
 * list command
 * @generated from apis/overlays/o11y.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		service: {
			kind: "parsed",
			brief:
				"Only include work in which an Agent of this Worker service took part.",
			optional: true,
			parse: String,
		},
		agent: {
			kind: "parsed",
			brief:
				"Only include work in which an Agent with this gen_ai.agent.name took part. With service, both must match the same Agent.",
			optional: true,
			parse: String,
		},
		from: {
			kind: "parsed",
			brief:
				"Start of the search window, as Unix epoch milliseconds. Defaults to 24 hours before to. Clamped to the 7-day retention boundary; the effective value is in result_info.from.",
			optional: true,
			parse: Number,
		},
		to: {
			kind: "parsed",
			brief:
				"End of the search window, as Unix epoch milliseconds. Defaults to now.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Maximum items to return per page. Defaults to 20.",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List Agent Traces",
	usage:
		"$0 o11y agents traces list\n\nLists Traces with Agent activity in the window, newest activity first, including work without a Conversation ID. The window defaults to the last 24 hours. Each summary covers the Trace's Agent spans (invoke_agent, chat, execute_tool): the Agents and Conversation IDs seen, duration, token usage, models, providers, and LLM call, tool call and error counts.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
