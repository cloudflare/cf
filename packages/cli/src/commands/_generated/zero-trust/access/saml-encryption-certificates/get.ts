/**
 * get command
 * @generated from apis/overlays/zero-trust.ts
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
			placeholder: "saml-cert-set-id",
			brief: "UID of the SAML certificate set.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <saml-cert-set-id>",
	describe: "Get SAML certificate set",
	usage:
		"$0 zero-trust access saml-encryption-certificates get <saml-cert-set-id>\n\nRetrieves a specific SAML encryption certificate set by its UID, including both current and previous certificates if available.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
