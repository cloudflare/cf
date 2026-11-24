/**
 * delete command
 * @generated from apis/overlays/ai-gateway.ts
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
			placeholder: "gateway-id",
			brief: "Unique identifier of the AI Gateway within the account.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <gateway-id>",
	describe: "Delete a gateway",
	usage:
		"$0 ai-gateway gateways delete <gateway-id>\n\nPermanently deletes an AI Gateway, its configuration, and its stored logs.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
