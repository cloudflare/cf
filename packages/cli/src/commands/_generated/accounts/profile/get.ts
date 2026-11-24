/**
 * get command
 * @generated from apis/overlays/accounts.ts
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get",
	describe: "Get account profile",
	usage:
		"$0 accounts profile get\n\nRetrieves the business profile (name, email, phone, address, and external metadata) associated with this account's customer record. Profiles can be shared across accounts and organizations. Only available to members of an organization that contains the account.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
