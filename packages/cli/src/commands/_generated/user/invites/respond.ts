/**
 * respond command
 * @generated from apis/overlays/user.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		status: {
			kind: "parsed",
			brief:
				"Status of your response to the invitation (rejected or accepted).",
			optional: true,
			choices: ["accepted", "rejected"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "status", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "invite-id",
			brief: "Invite identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "respond <invite-id>",
	describe: "Respond to Invitation",
	usage: "$0 user invites respond <invite-id>\n\nResponds to an invitation.",
	...parameters,
	loader: () => import("./respond.handler.js"),
});

export default command;
