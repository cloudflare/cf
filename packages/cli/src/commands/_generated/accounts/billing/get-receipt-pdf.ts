/**
 * get-receipt-pdf command
 * @generated from apis/overlays/accounts.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		doctype: {
			kind: "parsed",
			brief: "The document type to generate.",
			optional: true,
			parse: String,
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
		{ placeholder: "receipt-id", brief: "Receipt identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get-receipt-pdf <receipt-id>",
	describe: "Get Receipt PDF",
	usage:
		"$0 accounts billing get-receipt-pdf <receipt-id>\n\nDownloads a receipt as a PDF document.",
	...parameters,
	loader: () => import("./get-receipt-pdf.handler.js"),
});

export default command;
