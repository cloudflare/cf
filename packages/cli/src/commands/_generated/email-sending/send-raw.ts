/**
 * send-raw command
 * @generated from apis/overlays/email-sending.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		from: {
			kind: "parsed",
			brief: "Sender email address.",
			optional: true,
			parse: String,
		},
		"mime-message": {
			kind: "parsed",
			brief:
				"The full MIME-encoded email message. Should include standard RFC 5322 headers such as From, To, Subject, and Content-Type. The from and recipients fields in the request body control SMTP envelope routing; the From and To headers in the MIME message control what the recipient's email client displays.",
			optional: true,
			parse: String,
		},
		recipients: {
			kind: "parsed",
			brief: "List of recipient email addresses.",
			variadic: true,
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
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "send-raw",
	describe: "Send a raw MIME email",
	usage:
		"$0 email-sending send-raw\n\nSend a raw RFC 5322 (MIME) email for the specified account. Provide the full MIME message plus the SMTP envelope (from and recipients).",
	...parameters,
	loader: () => import("./send-raw.handler.js"),
});

export default command;
