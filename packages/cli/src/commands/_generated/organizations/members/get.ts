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
		"organization-id": {
			kind: "parsed",
			brief: "Organization ID",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "member-id",
			brief: "Organization Member ID",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <member-id>",
	describe: "Get organization member",
	usage:
		"$0 organizations members get <member-id>\n\nRetrieve a single membership from an Organization.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
