/**
 * get command
 * @generated from apis/overlays/browser-run.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"cache-ttl": {
			kind: "parsed",
			brief: "Cache TTL default is 5s. Set to 0 to disable.",
			optional: true,
			parse: Number,
		},
		status: {
			kind: "enum",
			brief: "Filter by URL status.",
			values: [
				"queued",
				"errored",
				"completed",
				"disallowed",
				"skipped",
				"cancelled",
			],
			optional: true,
		},
		cursor: {
			kind: "parsed",
			brief: "Cursor for pagination.",
			optional: true,
			parse: Number,
		},
		limit: {
			kind: "parsed",
			brief: "Limit for pagination.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "job-id", brief: "Crawl job ID.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <job-id>",
	describe: "Get crawl result.",
	usage:
		"$0 browser-run crawl get <job-id>\n\nReturns the result of a crawl job.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
