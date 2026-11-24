/**
 * send command
 * @generated from apis/overlays/workflows.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"workflow-name": { kind: "parsed", brief: "Workflow name", parse: String },
		"instance-id": {
			kind: "parsed",
			brief:
				"Instance identifier. User-created instances match `^[a-zA-Z0-9_][a-zA-Z0-9-_]*$` (max 100 characters); cron-triggered instances can use a longer, system-generated id derived from the cron expression.",
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
	operands: [{ placeholder: "event-type", brief: "Event type", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "send <event-type>",
	describe: "Send event to instance",
	usage:
		"$0 workflows instances events send <event-type>\n\nSends an event to a running workflow instance to trigger state transitions.",
	...parameters,
	loader: () => import("./send.handler.js"),
});

export default command;
