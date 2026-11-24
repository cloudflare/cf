/**
 * update command
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
		rules: {
			kind: "parsed",
			brief:
				'Array of rules to drive notifications. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"actions": ["PutObject" | "CopyObject" | "DeleteObject" | ...more], "description"?: string, "prefix"?: string, "suffix"?: string}]. ? marks optional keys.',
			optional: true,
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
	command: "update <queue-id>",
	describe: "Create Event Notification Rules",
	usage:
		"$0 r2 buckets event-notifications update <queue-id>\n\nCreates rules that send notifications for matching R2 object events to the specified Cloudflare Queue. Rules can filter objects by key prefix and suffix. New rules are added to any existing rules for the queue; a rule that overlaps an existing rule is rejected.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
