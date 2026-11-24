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
		name: {
			kind: "parsed",
			brief:
				"Exact step name from the instance logs response, including the generated counter suffix.",
			parse: String,
		},
		type: {
			kind: "enum",
			brief:
				"Step type to disambiguate step.do and waitForEvent entries that share the same name.",
			values: ["step", "waitForEvent"],
		},
		attempt: {
			kind: "parsed",
			brief: "Specific attempt number to retrieve output or error for.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		text: {
			kind: "boolean",
			brief:
				"Decode the response body as UTF-8 text instead of writing raw bytes",
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
	describe: "Get full step output from instance",
	usage:
		"$0 workflows instances step get <instance-id>\n\nRetrieves the full, untruncated output for a specific step on a workflow instance. Returns a flat status-shaped JSON body with step `status` ('running' | 'waiting' | 'complete' | 'errored'), `error` (nullable), and `output` (the step value, or null while running/waiting/errored). When the step returned a ReadableStream from step.do, the response is served as 'application/octet-stream' with the raw bytes as the body instead of JSON. A `status='running'` response with non-null `error` indicates the step is currently retrying after a prior attempt failed.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
