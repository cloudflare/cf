/**
 * get command
 * @generated from apis/overlays/organizations.ts
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
			placeholder: "organization-id",
			brief: "The ID of the organization to retrieve.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <organization-id>",
	describe: "Get organization",
	usage:
		"$0 organizations get <organization-id>\n\nRetrieve the details of a certain organization.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
