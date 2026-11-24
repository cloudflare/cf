/**
 * send command
 * @generated from apis/overlays/email-sending.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		attachments: {
			kind: "parsed",
			brief:
				'File attachments and inline images. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"content": string, "content_id": string, "disposition": "inline", "filename": string, "type": string} | {"content": string, "disposition": "attachment", "filename": string, "type": string})].',
			optional: true,
			parse: String,
		},
		"bcc-address": {
			kind: "parsed",
			brief: "Email address (e.g., 'user@example.com').",
			optional: true,
			parse: String,
		},
		"bcc-name": {
			kind: "parsed",
			brief:
				"Display name for the email address (e.g., 'John Doe'). Optional; set to null or leave it unset to send the address on its own.",
			optional: true,
			parse: String,
		},
		"cc-address": {
			kind: "parsed",
			brief: "Email address (e.g., 'user@example.com').",
			optional: true,
			parse: String,
		},
		"cc-name": {
			kind: "parsed",
			brief:
				"Display name for the email address (e.g., 'John Doe'). Optional; set to null or leave it unset to send the address on its own.",
			optional: true,
			parse: String,
		},
		"from-address": {
			kind: "parsed",
			brief: "Email address (e.g., 'user@example.com').",
			optional: true,
			parse: String,
		},
		"from-name": {
			kind: "parsed",
			brief:
				"Display name for the email address (e.g., 'John Doe'). Optional; set to null or leave it unset to send the address on its own.",
			optional: true,
			parse: String,
		},
		headers: {
			kind: "parsed",
			brief:
				'Custom email headers as key-value pairs. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
			optional: true,
			parse: String,
		},
		html: {
			kind: "parsed",
			brief:
				"HTML body of the email. Provide at least one of text or html (non-empty).",
			optional: true,
			parse: String,
		},
		"reply-to-address": {
			kind: "parsed",
			brief: "Email address (e.g., 'user@example.com').",
			optional: true,
			parse: String,
		},
		"reply-to-name": {
			kind: "parsed",
			brief:
				"Display name for the email address (e.g., 'John Doe'). Optional; set to null or leave it unset to send the address on its own.",
			optional: true,
			parse: String,
		},
		subject: {
			kind: "parsed",
			brief: "Email subject line.",
			optional: true,
			parse: String,
		},
		text: {
			kind: "parsed",
			brief:
				"Plain text body of the email. Provide at least one of text or html (non-empty).",
			optional: true,
			parse: String,
		},
		"to-address": {
			kind: "parsed",
			brief: "Email address (e.g., 'user@example.com').",
			optional: true,
			parse: String,
		},
		"to-name": {
			kind: "parsed",
			brief:
				"Display name for the email address (e.g., 'John Doe'). Optional; set to null or leave it unset to send the address on its own.",
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
	operands: [],
	rules(rules) {
		rules.implies("bcc-name", ["bcc-address"]);
		rules.implies("cc-name", ["cc-address"]);
		rules.implies("from-name", ["from-address"]);
		rules.implies("reply-to-name", ["reply-to-address"]);
		rules.implies("to-name", ["to-address"]);
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "send",
	describe: "Send an email",
	usage:
		"$0 email-sending send\n\nSend an email for the specified account using the structured builder. Provide the sender, recipients, subject, and at least one of text or html; attachments are optional.",
	...parameters,
	loader: () => import("./send.handler.js"),
});

export default command;
