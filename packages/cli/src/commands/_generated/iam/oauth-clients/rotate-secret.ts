/**
 * rotate-secret command
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
	command: "rotate-secret <oauth-client-id>",
	describe: "Rotate OAuth Client Secret",
	usage:
		"$0 iam oauth-clients rotate-secret <oauth-client-id>\n\nCreates a second client secret so you can update your client configuration before deleting the old one. The `has_rotated_secret` field on the client will be set to `true`.",
	...parameters,
	loader: () => import("./rotate-secret.handler.js"),
});

export default command;
