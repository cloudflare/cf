/**
 * rotate command
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
			brief: "UID of the SAML certificate set to rotate.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "rotate <saml-cert-set-id>",
	describe: "Rotate SAML certificate",
	usage:
		"$0 zero-trust access saml-encryption-certificates rotate <saml-cert-set-id>\n\nRotates the SAML encryption certificates within the specified certificate set. This generates a new certificate and moves the current certificate to the previous slot. If a previous certificate exists, it will be deactivated and removed. This endpoint ensures zero-downtime rotation by maintaining both current and previous certificates during the transition period, allowing IdPs time to update their configurations. Automated rotation happens 30 days before a current certificate's expiration.",
	...parameters,
	loader: () => import("./rotate.handler.js"),
});

export default command;
