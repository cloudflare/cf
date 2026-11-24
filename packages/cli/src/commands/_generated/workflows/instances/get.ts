/**
 * get command
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
		simple: {
			kind: "enum",
			brief:
				"When true, omits step details and returns only metadata with step_count.",
			values: ["true", "false"],
			optional: true,
		},
		order: {
			kind: "enum",
			brief:
				'Step ordering: "asc" (default, oldest first) or "desc" (newest first).',
			values: ["asc", "desc"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
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
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <instance-id>",
	describe: "Get logs and status from instance",
	usage:
		"$0 workflows instances get <instance-id>\n\nRetrieves logs and execution status for a specific workflow instance.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
