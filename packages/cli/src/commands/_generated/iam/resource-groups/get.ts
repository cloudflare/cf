/**
 * get command
 * @generated from apis/overlays/iam.ts
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
			placeholder: "resource-group-id",
			brief: "Resource Group identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <resource-group-id>",
	describe: "Resource Group Details",
	usage:
		"$0 iam resource-groups get <resource-group-id>\n\nGet information about a specific resource group in an account.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
