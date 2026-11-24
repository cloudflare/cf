/**
 * occurrences command
 * @generated from apis/overlays/o11y.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		cursor: {
			kind: "parsed",
			brief: "Opaque cursor returned in result_info.cursors.after.",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief: "Per page",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "issue-id",
			brief: "Issue ID returned by the issues API.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "occurrences <issueId>",
	describe: "List issue occurrences",
	usage:
		"$0 o11y issues occurrences <issueId>\n\nList the retained error occurrences grouped into an issue, newest first.",
	...parameters,
	loader: () => import("./occurrences.handler.js"),
});

export default command;
