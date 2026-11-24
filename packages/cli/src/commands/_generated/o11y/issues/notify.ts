/**
 * notify command
 * @generated from apis/overlays/o11y.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"policy-id": {
			kind: "parsed",
			brief: "The policyId field",
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
	operands: [{ placeholder: "issue-id", brief: "IssueId", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "notify <issueId>",
	describe: "Notify about an issue",
	usage:
		"$0 o11y issues notify <issueId>\n\nSend the issue to one ANS policy, or every matching Real-Time Issue policy when no policy ID is provided.",
	...parameters,
	loader: () => import("./notify.handler.js"),
});

export default command;
