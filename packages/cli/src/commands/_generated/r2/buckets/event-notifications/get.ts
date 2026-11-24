/**
 * get command
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
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
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
	command: "get <queue-id>",
	describe: "Get Event Notification Rules for a Queue",
	usage:
		"$0 r2 buckets event-notifications get <queue-id>\n\nGets the event notification rules for the specified R2 bucket and Cloudflare Queue. The response includes the queue's configuration and its array of rules.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
