/**
 * delete command
 * @generated from apis/overlays/r2.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"bucket-name": {
			kind: "parsed",
			brief: "Name of the bucket.",
			parse: String,
		},
		"cf-r2-jurisdiction": {
			kind: "parsed",
			brief:
				"Jurisdiction where objects in this bucket are guaranteed to be stored.",
			optional: true,
			parse: String,
		},
		"rule-ids": {
			kind: "parsed",
			brief: "Array of rule ids to delete.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
			placeholder: "queue-id",
			brief:
				"ID of the Cloudflare Queue that receives notifications for matching R2 object events.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <queue-id>",
	describe: "Delete Event Notification Rules",
	usage:
		"$0 r2 buckets event-notifications delete <queue-id>\n\nDeletes the specified event notification rules for an R2 bucket and Cloudflare Queue. Provide ruleIds in the request body to select rules. If no body is provided, all rules for that bucket and queue are deleted.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
