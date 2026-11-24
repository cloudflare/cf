/**
 * delete command
 * @generated from apis/overlays/alerting.ts
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "webhook-id",
			brief: "The unique identifier of a webhook",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <webhook-id>",
	describe: "Delete a webhook",
	usage:
		"$0 alerting destinations webhooks delete <webhook-id>\n\nDelete a configured webhook destination.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
