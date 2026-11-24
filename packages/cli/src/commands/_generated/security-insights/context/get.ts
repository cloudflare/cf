/**
 * get command
 * @generated from apis/overlays/security-insights.ts
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
	operands: [{ placeholder: "issue-id", brief: "Issue ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <issue-id>",
	describe: "Retrieves Security Center Insight Context",
	usage:
		"$0 security-insights context get <issue-id>\n\nReturns the full context payload for an insight. This endpoint is used for insights with large payloads that are not included inline in the list response.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
