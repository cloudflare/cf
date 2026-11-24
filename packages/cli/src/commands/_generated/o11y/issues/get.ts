/**
 * get command
 * @generated from apis/overlays/o11y.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "issue-id", brief: "IssueId", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <issueId>",
	describe: "Get an issue",
	usage: "$0 o11y issues get <issueId>\n\nRetrieve an issue.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
