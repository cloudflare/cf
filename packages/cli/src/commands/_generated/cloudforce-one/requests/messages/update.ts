/**
 * update command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"project-type": { kind: "parsed", brief: "Project type", parse: String },
		"request-id": { kind: "parsed", brief: "Request ID", parse: String },
		"idempotency-key": {
			kind: "parsed",
			brief:
				"Client command key. Required when publishing a message for a workflow-enabled project; trimmed and limited to 255 characters.",
			optional: true,
			parse: String,
		},
		"attachment-asset-ids": {
			kind: "parsed",
			brief: "The attachment_asset_ids field",
			variadic: true,
			optional: true,
			parse: String,
		},
		content: {
			kind: "parsed",
			brief: "The content field",
			optional: true,
			parse: String,
		},
		publish: { kind: "boolean", brief: "The publish field", optional: true },
		tlp: {
			kind: "parsed",
			brief: "The tlp field",
			optional: true,
			choices: ["clear", "green", "amber", "amber-strict", "red", "white"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "tlp", "text"),
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
	operands: [{ placeholder: "message-id", brief: "Message ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <message-id>",
	describe: "Update/publish a message for an RFI request",
	usage:
		"$0 cloudforce-one requests messages update <message-id>\n\nUpdates an existing message, typically to publish a draft by setting publish=true. Workflow-enabled publication requires Idempotency-Key and atomically records message activity and any policy transition.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
