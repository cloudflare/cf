/**
 * bulk-mark-read command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"article-ids": {
			kind: "parsed",
			brief: "Array of article UUIDs to mark (1-50).",
			variadic: true,
			optional: true,
			parse: String,
		},
		read: {
			kind: "boolean",
			brief: "True to mark read, false to mark unread.",
			optional: true,
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
	command: "bulk-mark-read",
	describe: "Bulk update Threat Signals article read status",
	usage:
		"$0 cloudforce-one threat-signals articles bulk-mark-read\n\nMarks up to 50 Threat Signals articles as read or unread.",
	...parameters,
	loader: () => import("./bulk-mark-read.handler.js"),
});

export default command;
