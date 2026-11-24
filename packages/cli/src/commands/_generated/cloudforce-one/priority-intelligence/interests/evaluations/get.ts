/**
 * get command
 * @generated from apis/overlays/cloudforce-one.ts
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
	operands: [
		{ placeholder: "evaluation-id", brief: "Evaluation UUID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <evaluation-id>",
	describe: "Get a persisted account-interest evaluation",
	usage:
		"$0 cloudforce-one priority-intelligence interests evaluations get <evaluation-id>\n\nReturns a previously completed live account-interest evaluation by ID. The evaluation must belong to this account.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
