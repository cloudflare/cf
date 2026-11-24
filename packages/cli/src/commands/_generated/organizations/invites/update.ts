/**
 * update command
 * @generated from apis/overlays/organizations.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"organization-id": {
			kind: "parsed",
			brief: "The ID of the organization associated with the invitation.",
			parse: String,
		},
		status: {
			kind: "parsed",
			brief: "The status field",
			optional: true,
			choices: ["accept", "reject"],
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
			brief:
				"The invitation action. Use `accept` to join the organization or `reject` to decline the invitation.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "member-code",
			brief: "The invitation code to accept or reject.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <member-code>",
	describe: "Handle organization invite",
	usage:
		"$0 organizations invites update <member-code>\n\nAccept or reject an invitation to a specific organization. The credential must belong to the invited user. No additional API token permission is required.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
