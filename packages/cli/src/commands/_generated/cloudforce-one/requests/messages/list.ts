/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"project-type": { kind: "parsed", brief: "Project type", parse: String },
		"request-id": { kind: "parsed", brief: "Request ID", parse: String },
		page: { kind: "parsed", brief: "Page", optional: true, parse: String },
		"per-page": {
			kind: "parsed",
			brief: "Per page",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List messages for an RFI request",
	usage:
		"$0 cloudforce-one requests messages list\n\nRetrieves the published, non-deleted messages visible to the agent for an RFI request, with pagination.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
