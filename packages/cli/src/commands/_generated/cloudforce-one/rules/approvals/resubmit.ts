/**
 * resubmit command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"commit-message": {
			kind: "parsed",
			brief: "The commit_message field",
			optional: true,
			parse: String,
		},
		content: {
			kind: "parsed",
			brief: "The content field",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		enabled: { kind: "boolean", brief: "The enabled field", optional: true },
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		namespaces: {
			kind: "parsed",
			brief: "The namespaces field",
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
	operands: [
		{
			placeholder: "id",
			brief: "The unique identifier for the approval.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "resubmit <id>",
	describe: "Revise and resubmit a rejected approval",
	usage:
		"$0 cloudforce-one rules approvals resubmit <id>\n\nCreate a new pending revision from a rejected rule approval. Only the original requester may resubmit the latest revision.",
	...parameters,
	loader: () => import("./resubmit.handler.js"),
});

export default command;
