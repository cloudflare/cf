/**
 * update command
 * @generated from apis/overlays/o11y.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		status: {
			kind: "parsed",
			brief: "The status field",
			optional: true,
			choices: ["active", "resolved", "ignored"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "status", "text"),
		},
		title: {
			kind: "parsed",
			brief: "The title field",
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
			brief: "Modify an issue status or group title.",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "issue-id", brief: "IssueId", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <issueId>",
	describe: "Modify an issue",
	usage:
		"$0 o11y issues update <issueId>\n\nModify an issue status or group title.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
