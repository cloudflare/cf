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
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "identity-provider-id", brief: "UUID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <identity-provider-id>",
	describe: "Create SAML encryption certificate for Identity Provider",
	usage:
		"$0 zero-trust identity-providers saml-certificate create <identity-provider-id>\n\nCreates a new SAML encryption certificate set and assigns it to the specified SAML Identity Provider. This endpoint is idempotent - if the IdP already has a certificate set assigned, the existing certificate set is returned with a 200 status. **Workflow for enabling SAML encryption:** 1. Call this endpoint to create and assign a certificate set to the IdP 2. Update the IdP configuration (PUT `/identity_providers/{id}`) with: - `config.enable_encryption: true` - `saml_certificate_set_id: <uid from step 1>` 3. Configure the certificate's public key in your external SAML Identity Provider",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
