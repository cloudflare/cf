/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"idp-id": {
			kind: "parsed",
			brief:
				"UID of the identity provider to federate. Must be an existing identity provider in this account. One-time pin and Cloudflare-managed identity providers cannot be federated.",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create an IdP federation grant",
	usage:
		"$0 zero-trust identity-providers federation-grants create\n\nCreates an IdP federation grant for the specified identity provider, making it available for federation to other accounts in the same Cloudflare organization. The account must belong to a Cloudflare organization. One-time pin and Cloudflare-managed identity providers cannot be federated. An account can federate at most five identity providers at a time.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
