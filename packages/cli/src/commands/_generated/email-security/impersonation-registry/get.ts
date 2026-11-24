/**
 * get command
 * @generated from apis/overlays/email-security.ts
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
			placeholder: "impersonation-registry-id",
			brief: "Impersonation registry entry identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <impersonation-registry-id>",
	describe: "Get an impersonation registry entry",
	usage:
		"$0 email-security impersonation-registry get <impersonation-registry-id>\n\nRetrieves details for a specific impersonation registry entry including the protected identity, email pattern, and synchronization source if directory-synced.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
