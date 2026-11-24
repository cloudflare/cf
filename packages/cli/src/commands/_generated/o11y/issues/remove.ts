/**
 * remove command
 * @generated from apis/overlays/o11y.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"group-id": { kind: "parsed", brief: "GroupId", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [{ placeholder: "issue-id", brief: "IssueId", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "remove <issueId>",
	describe: "Remove an issue group member",
	usage:
		"$0 o11y issues remove <issueId>\n\nRemove an issue from a group, dissolving the group when fewer than two members remain.",
	...parameters,
	loader: () => import("./remove.handler.js"),
});

export default command;
