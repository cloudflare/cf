/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "delete <resource-group-id>",
	describe: "Remove Resource Group",
	usage:
		"$0 iam resource-groups delete <resource-group-id>\n\nRemove a resource group from an account.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
