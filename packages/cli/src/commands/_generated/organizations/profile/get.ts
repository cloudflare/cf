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
			brief: "The ID of the organization to retrieve a profile for.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <organization-id>",
	describe: "Get organization profile",
	usage:
		"$0 organizations profile get <organization-id>\n\nRetrieves the business profile (name, email, phone, address, and external metadata) associated with this organization's customer record. Profiles can be shared across accounts and organizations. Only available to members of the organization.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
