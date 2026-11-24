/**
 * move command
 * @generated from apis/overlays/accounts.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"destination-organization-id": {
			kind: "parsed",
			brief: "The ID of the organization to move the account into.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"The destination organization ID is where the account is to be moved.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "move",
	describe: "Move account to organization",
	usage:
		"$0 accounts move\n\nMove an account into a destination organization, either assigning a standalone account to an organization or moving it between organizations in the same hierarchy. Availability depends on the organization's capabilities.",
	...parameters,
	loader: () => import("./move.handler.js"),
});

export default command;
