/**
 * create command
 * @generated from apis/overlays/organizations.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"member-user-email": {
			kind: "parsed",
			brief: "The member.user.email field",
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "organization-id", brief: "Organization ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <organization-id>",
	describe: "Create organization member",
	usage:
		"$0 organizations members create <organization-id>\n\nCreate a membership that grants access to a specific Organization.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
