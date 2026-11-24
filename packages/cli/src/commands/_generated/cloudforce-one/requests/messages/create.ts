/**
 * create command
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
		"author-id": {
			kind: "parsed",
			brief: "The author_id field",
			optional: true,
			parse: String,
		},
		"author-name": {
			kind: "parsed",
			brief: "The author_name field",
			optional: true,
			parse: String,
		},
		content: {
			kind: "parsed",
			brief: "The content field",
			optional: true,
			parse: String,
		},
		publish: { kind: "boolean", brief: "The publish field", default: false },
		tlp: {
			kind: "parsed",
			brief: "The tlp field",
			default: "red",
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
	operands: [{ placeholder: "request-id", brief: "Request ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <request-id>",
	describe: "Create a customer follow-on message on an RFI request",
	usage:
		"$0 cloudforce-one requests messages create <request-id>\n\nCreates a customer dashboard message on an RFI request. Messages are always published on send. Workflow-enabled projects require Idempotency-Key and atomically record message activity and any policy transition. For token-billed project types, substantive follow-on messages consume message tokens and are subject to quarterly quota enforcement.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
