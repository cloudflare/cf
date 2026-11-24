/**
 * mark-read command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		read: {
			kind: "boolean",
			brief: "True to mark the article read, false to mark unread.",
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
	operands: [
		{
			placeholder: "article-id",
			brief: "Threat Signals article UUID",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "mark-read <article-id>",
	describe: "Update Threat Signals article read status",
	usage:
		"$0 cloudforce-one threat-signals articles mark-read <article-id>\n\nMarks a Threat Signals article as read or unread.",
	...parameters,
	loader: () => import("./mark-read.handler.js"),
});

export default command;
