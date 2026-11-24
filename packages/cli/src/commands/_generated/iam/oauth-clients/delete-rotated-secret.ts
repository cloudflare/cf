/**
 * delete-rotated-secret command
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
			placeholder: "oauth-client-id",
			brief: "The unique identifier for an OAuth client.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete-rotated-secret <oauth-client-id>",
	describe: "Delete Rotated OAuth Client Secret",
	usage:
		"$0 iam oauth-clients delete-rotated-secret <oauth-client-id>\n\nRemoves the old client secret after a rotation, keeping only the new one. Use this after you have updated your client configuration to use the new secret. The `has_rotated_secret` field on the client indicates whether there is an old secret to delete.",
	...parameters,
	loader: () => import("./delete-rotated-secret.handler.js"),
});

export default command;
