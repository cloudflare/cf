/**
 * delete command
 * @generated from apis/overlays/zero-trust.ts
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
			brief: "A UUID identifying the webhook configuration.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <webhook-id>",
	describe: "Delete a webhook configuration",
	usage:
		"$0 zero-trust casb webhooks delete <webhook-id>\n\nSoft deletes a webhook configuration by its unique identifier. The webhook will be marked as deleted and will no longer be available for use.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
