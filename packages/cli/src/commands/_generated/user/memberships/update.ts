/**
 * update command
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
			brief: "Whether to accept or reject this account invitation.",
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
			placeholder: "membership-id",
			brief: "Membership identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <membership-id>",
	describe: "Update Membership",
	usage:
		"$0 user memberships update <membership-id>\n\nAccept or reject this account invitation.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
