/**
 * cancel command
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
		{
			placeholder: "id",
			brief: "The unique identifier for the approval.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "cancel <id>",
	describe: "Cancel a pending approval",
	usage:
		"$0 cloudforce-one rules approvals cancel <id>\n\nCancel a pending rule approval. Only its original requester may cancel it.",
	...parameters,
	loader: () => import("./cancel.handler.js"),
});

export default command;
