/**
 * pause command
 * @generated from apis/overlays/workflows.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"workflow-name": { kind: "parsed", brief: "Workflow name", parse: String },
		status: {
			kind: "parsed",
			brief: "The status field",
			optional: true,
			choices: ["pause", "resume", "terminate", "restart"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "status", "text"),
		},
		rollback: {
			kind: "boolean",
			brief: "Run rollback before terminating.",
			optional: true,
		},
		"from-count": {
			kind: "parsed",
			brief: "The from.count field",
			optional: true,
			parse: Number,
		},
		"from-name": {
			kind: "parsed",
			brief: "The from.name field",
			optional: true,
			parse: String,
		},
		"from-type": {
			kind: "parsed",
			brief: "The from.type field",
			optional: true,
			choices: ["do", "sleep", "waitForEvent"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "from-type", "text"),
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
	operands: [
		{
			placeholder: "instance-id",
			brief:
				"Instance identifier. User-created instances match \`^[a-zA-Z0-9_][a-zA-Z0-9-_]*$\` (max 100 characters); cron-triggered instances can use a longer, system-generated id derived from the cron expression.",
			parse: String,
		},
	],
	rules(rules) {
		rules.conflicts("rollback", ["from-count", "from-name", "from-type"]);
		rules.conflicts("from-count", ["rollback"]);
		rules.implies("from-count", ["from-name"]);
		rules.conflicts("from-name", ["rollback"]);
		rules.conflicts("from-type", ["rollback"]);
		rules.implies("from-type", ["from-name"]);
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "pause <instance-id>",
	describe: "Change status of instance",
	usage:
		"$0 workflows instances pause <instance-id>\n\nChanges the execution status of a workflow instance (e.g., pause, resume, terminate).",
	...parameters,
	loader: () => import("./pause.handler.js"),
});

export default command;
